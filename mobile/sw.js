// ============================================================
// sw.js — Gestio Service Worker (Cache-First + Debug)
// ============================================================

const CACHE_VERSION = "v2";
const STATIC_CACHE = `gestio-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `gestio-dynamic-${CACHE_VERSION}`;
const BASE_PATH = "/mobile/";

const STATIC_ASSETS = [
  `${BASE_PATH}pyodide/pyodide.js`,
  `${BASE_PATH}pyodide/pyodide.mjs`,
  `${BASE_PATH}pyodide/pyodide.asm.js`,
  `${BASE_PATH}pyodide/pyodide.asm.wasm`,
  `${BASE_PATH}pyodide/python_stdlib.zip`,
  `${BASE_PATH}pyodide/pyodide-lock.json`,
  `${BASE_PATH}pyodide/typing_extensions-4.7.1-py3-none-any.whl`,
  `${BASE_PATH}pyodide/pydantic-1.10.7-py3-none-any.whl`,
  `${BASE_PATH}pyodide/PyYAML-6.0.1-cp311-cp311-emscripten_3_1_46_wasm32.whl`,
  `${BASE_PATH}pyodide/python_dotenv-1.0.1-py3-none-any.whl`,
  `${BASE_PATH}pyodide/python_dateutil-2.8.2-py2.py3-none-any.whl`,
  `${BASE_PATH}pyodide/pypdf-6.9.1-py3-none-any.whl`,
  `${BASE_PATH}pyodide/charset_normalizer-3.4.6-py3-none-any.whl`,
  `${BASE_PATH}pyodide/pdfminer_six-20260107-py3-none-any.whl`,
  `${BASE_PATH}backend.zip`,
  `${BASE_PATH}bootstrap.py`,
];

const NETWORK_ONLY_ORIGINS = ["api.groq.com", "accounts.google.com"];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing v" + CACHE_VERSION + "...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      let successCount = 0, failCount = 0;
      for (const url of STATIC_ASSETS) {
        try {
          await cache.add(url);
          successCount++;
          console.log("[SW] Cached: " + url);
        } catch (err) {
          failCount++;
          console.warn("[SW] Failed to cache: " + url, err);
        }
      }
      console.log(`[SW] Pre-cache done: ${successCount} success, ${failCount} failed`);
    }).then(() => {
      console.log("[SW] Install complete, skipping waiting");
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log("[SW] Deleting old cache: " + key);
            return caches.delete(key);
          })
      )
    ).then(() => {
      console.log("[SW] Activate complete");
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (NETWORK_ONLY_ORIGINS.some((origin) => url.hostname.includes(origin))) {
    return;
  }

  if (event.request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match(BASE_PATH + "/mobile/index.html");
        }
      });
    })
  );
});
