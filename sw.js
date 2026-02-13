const CACHE_NAME = "mf-nomads-313e7d4";
const PRECACHE = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;

      const isExternal =
        e.request.url.includes("cdn.sanity.io") ||
        e.request.url.includes("fonts.googleapis.com") ||
        e.request.url.includes("fonts.gstatic.com");

      return fetch(e.request, {
        mode: isExternal ? "no-cors" : "cors",
      })
        .then((res) => {
          if (res.ok || res.type === "opaque") {
            const clone = res.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => {
          return new Response("Offline - resource not cached", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
    }),
  );
});
