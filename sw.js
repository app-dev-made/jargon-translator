const CACHE_NAME = 'jargon-lens-v2';
const ASSETS = [
  'index.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'icons/icon-72x72.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
