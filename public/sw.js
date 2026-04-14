const CACHE_NAME = 'openpot-secure-timer-v12';
// Version: v0.2.0+7a33993
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icon-512.png',
  '/icon-192.png',
  '/apple-icon-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => (key === CACHE_NAME ? Promise.resolve() : caches.delete(key)))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass for non-GET and non-local requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Bypass for API requests - Fast fail in background
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Global strategy: Network-Timeout for Navigation, Cache-First for Assets
  const isNavigation = request.mode === 'navigate';
  
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Create a fetch promise with a timeout fallback
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      });

      // If we have a cached response, return it immediately for assets
      if (cachedResponse && !isNavigation) {
        return cachedResponse;
      }

      // For navigation or missing assets, wait for network but with a timeout
      return Promise.race([
        fetchPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), isNavigation ? 3500 : 5000))
      ]).catch(() => cachedResponse || Response.error());
    })
  );
});
