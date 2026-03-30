const CACHE_NAME = 'ee-v2-enterprise';
const ASSETS = [
  'index.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Install: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

// Fetch: Smart Strategy
self.addEventListener('fetch', (event) => {
  // Ignore API calls to Gemini - always go to network
  if (event.request.url.includes('googleapis.com')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Only cache our own assets
          if (event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('index.html');
      }
    })
  );
});
