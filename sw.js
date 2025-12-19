const CACHE_NAME = 'ddrive-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './storage.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18.2.0/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js',
  'https://unpkg.com/recharts@2.12.7/umd/Recharts.js',
  'https://unpkg.com/lucide@0.378.0/dist/umd/lucide.min.js'
];

// Install Event: Cache all critical assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS)
        .then(() => self.skipWaiting())
        .catch(err => {
          console.error('Service Worker: Cache failed during install', err);
          throw err;
        });
    })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cache	names.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => self.clients.claim());
    })
  );
});

// Fetch Event: Provide offline support with network-first strategy
self.addEventListener('fetch', (e) => {
  // Skip non-GET requests and non-HTTP(S) URLs
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) {
    return;
  }

  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(e.request)
        .then((networkResponse) => {
          // Update cache with fresh response
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(e.request);
        });
    })
  );
});
