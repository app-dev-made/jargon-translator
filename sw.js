
const CACHE_NAME = 'easyenglish-v7-ultra';
const STATIC_ASSETS = [
  '/jargon-translator/',
  '/jargon-translator/index.html',
  '/jargon-translator/manifest.json',
  '/jargon-translator/icons/icon-192x192.png',
  '/jargon-translator/icons/icon-512x512.png',
  '/jargon-translator/icons/maskable-icon-512x512.png',
  '/jargon-translator/screenshots/mobile-home.png',
  '/jargon-translator/screenshots/desktop-home.png'
];

// 1. Install - Immediate Control
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Establishing Ultra Cache');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate - Cache Purge
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch - High-Performance Strategy
// --- ENHANCED FETCH STRATEGY ---
self.addEventListener('fetch', (event) => {
  // We only want to handle standard GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        // 1. Try to get a fresh version from the network
        const networkResponse = await fetch(event.request);
        
        // 2. If it's a successful response, save a copy in the cache for next time
        if (networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // 3. NETWORK FAILED: Try to serve from cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        // 4. OFFLINE FALLBACK: If both fail and user is navigating, show the app
        if (event.request.mode === 'navigate') {
          const fallback = await cache.match('/jargon-translator/index.html');
          return fallback;
        }
      }
    })()
  );
});
// 4. Background Sync for offline recovery
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-translations') {
    event.waitUntil(console.log('[Service Worker] Syncing pending translations...'));
  }
});
// 5. Push Notification Listener
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : 'New translation ready!';
  event.waitUntil(
    self.registration.showNotification('EasyEnglish AI', {
      body: data,
      icon: '/jargon-translator/icons/icon-192x192.png',
      badge: '/jargon-translator/icons/icon-72x72.png'
    })
  );
});
