// ============================================================
// sw.js — Gestio Service Worker (Cache-First)
// Issue #37 — Phase 4: Bundling & Offline
// ============================================================

const CACHE_VERSION = "v1";
const STATIC_CACHE = `gestio-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `gestio-dynamic-${CACHE_VERSION}`;

// Fichiers lourds à pré-cacher à l'installation
const STATIC_ASSETS = [
  // Pyodide runtime
  "/pyodide/pyodide.js",
  "/pyodide/pyodide.mjs",
  "/pyodide/pyodide.asm.js",
  "/pyodide/pyodide.asm.wasm",
  "/pyodide/python_stdlib.zip",
  "/pyodide/pyodide-lock.json",
  // Wheels Python
  "/pyodide/typing_extensions-4.7.1-py3-none-any.whl",
  "/pyodide/pydantic-1.10.7-py3-none-any.whl",
  "/pyodide/PyYAML-6.0.1-cp311-cp311-emscripten_3_1_46_wasm32.whl",
  "/pyodide/python_dotenv-1.0.1-py3-none-any.whl",
  "/pyodide/python_dateutil-2.8.2-py2.py3-none-any.whl",
  "/pyodide/pypdf-6.9.1-py3-none-any.whl",
  "/pyodide/charset_normalizer-3.4.6-py3-none-any.whl",
  "/pyodide/pdfminer_six-20260107-py3-none-any.whl",
  // Backend
  "/backend.zip",
  "/bootstrap.py",
];

// Domaines à ne JAMAIS cacher (réseau uniquement)
const NETWORK_ONLY_ORIGINS = [
  "api.groq.com",
  "accounts.google.com",
];

// ────────────────────────────────────────────────────────────
// INSTALL — pré-cache des assets statiques
// ────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installing — pre-caching static assets...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to pre-cache ${url}:`, err);
          })
        )
      );
    }).then(() => {
      console.log("[SW] Static assets cached, skipping waiting...");
      return self.skipWaiting();
    })
  );
});

// ────────────────────────────────────────────────────────────
// ACTIVATE — purge des anciens caches
// ────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating — cleaning old caches...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ────────────────────────────────────────────────────────────
// FETCH — stratégie Cache-First
// ────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Réseau uniquement pour les APIs externes
  if (NETWORK_ONLY_ORIGINS.some((origin) => url.hostname.includes(origin))) {
    return; // laisser le navigateur gérer
  }

  // 2. Ignorer les requêtes non-GET
  if (event.request.method !== "GET") return;

  // 3. Ignorer les extensions Capacitor / chrome-extension
  if (!url.protocol.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Cache-First : on sert depuis le cache directement
        return cached;
      }

      // Pas dans le cache → réseau + mise en cache dynamique
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback offline : retourner index.html pour navigation SPA
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
