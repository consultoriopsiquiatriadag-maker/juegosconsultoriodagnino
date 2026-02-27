const CACHE_NAME = "dagnino-pwa-v3"; // <- subí versión cuando cambies iconos/manifest

// Archivos base para offline (EVITÁ precachear íconos/manifest para que no queden viejos)
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/instalar.html",
  "/psicoeducacion.html",
  "/higienedelsueno.html",
  "/reels.html",
  "/juego1.html",
  "/juego2.html",
  "/juego3.html",
  "/premio_excelente.mp3"
];

// Rutas “sensibles” que deben traer siempre lo más nuevo (con fallback offline)
const NEVER_STALE = new Set([
  "/manifest.webmanifest",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/favicon.ico"
]);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// HTML: network-first (actualiza si hay internet)
// Assets: cache-first (rápido y offline)
// Manifest/Iconos: network-first + no-store (evita íconos cacheados)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // 1) Manifest e iconos: Network-first fuerte
  if (NEVER_STALE.has(url.pathname)) {
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 2) HTML: network-first
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/index.html")))
    );
    return;
  }

  // 3) Otros assets: cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
      );
    })
  );
});
