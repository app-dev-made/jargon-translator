const CACHE_NAME = 'easyenglish-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});

self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic Sync active');
});

self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync active');
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'EasyEnglish is ready!',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-72x72.png'
  };
  event.waitUntil(
    self.registration.showNotification('EasyEnglish', options)
  );
});
