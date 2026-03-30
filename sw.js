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
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass cache for Gemini AI API and External Scripts
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Only cache successful GET requests from our own origin
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET' && url.origin === self.location.origin) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Global Offline Fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/jargon-translator/index.html');
        }
      });

      return cachedResponse || fetchPromise;
    })
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
