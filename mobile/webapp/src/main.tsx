import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './index.css'
import App from './App.tsx'

console.log('[App] Version: 2026.03.24.1545')

// ── Service Worker Registration (Phase 4 — Offline) ──────────
/* DISABLE SW FOR DEV TO AVOID CACHING ISSUES
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .then((reg) => console.log('[SW] Registered, scope:', reg.scope))
      .catch((err) => console.error('[SW] Registration failed:', err))
  })
}
*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
