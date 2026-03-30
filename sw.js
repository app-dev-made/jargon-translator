const CACHE_NAME = 'easyenglish-v3-core';

// The "App Shell" - Files needed to open the app offline
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/maskable-icon-512x512.png',
  './icons/apple-touch-icon.png'
];

// 1. INSTALL: Cache the core files immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forces the browser to activate this SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(APP_SHELL).catch(err => console.warn('[SW] Some assets missing, skipping...', err));
    })
  );
});

// 2. ACTIVATE: Clean up old caches if you update the app
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Take control of all pages immediately
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. FETCH: Serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: Never intercept Gemini API calls or extension requests
  if (url.hostname.includes('googleapis.com') || url.protocol === 'chrome-extension:') {
    return;
  }

  // Network-First strategy for the HTML file (ensures users always get the newest version if online)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache-First strategy for images and icons (loads instantly)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
