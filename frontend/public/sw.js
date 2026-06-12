const CACHE_NAME = "simaya-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle standard GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (!url.protocol.startsWith("http")) return;
  if (
    url.pathname.startsWith("/_next/") || 
    url.pathname.includes("webpack") || 
    url.pathname.includes("hmr")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          // Cache successful same-origin responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          // Avoid caching Next.js build chunks or dynamic paths in dev mode
          if (url.pathname.startsWith("/_next/")) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch((err) => {
          // Offline fallback triggers homepage ONLY for navigation/HTML requests
          const acceptHeader = event.request.headers.get("accept");
          if (
            event.request.mode === "navigate" || 
            (acceptHeader && acceptHeader.includes("text/html"))
          ) {
            return caches.match("/");
          }
          // Do not return anything (let it fail naturally) for CSS, JS, images, etc.
          return new Response("Offline resource unavailable", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({ "Content-Type": "text/plain" }),
          });
        });
    })
  );
});
