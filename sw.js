const CACHE_NAME = 'qr-studio-v2.2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './src/qr-payloads.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './vendor/qr-code-styling.js',
  './vendor/jsQR.js',
  './locales/es.json',
  './locales/en.json',
  './locales/zh.json',
  './locales/ru.json',
  './locales/de.json',
  './locales/it.json',
  './locales/pl.json',
  './locales/pt.json',
  './locales/fr.json',
  './locales/ja.json',
  './locales/ko.json',
  './locales/ar.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First for local assets, Cache-First for CDNs/external assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests. POST and other methods must bypass cache completely
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const isLocalAsset = url.origin === self.location.origin;
  const isNavigation = event.request.mode === 'navigate';

  if (isLocalAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid response, cache it
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          if (isNavigation) {
            return caches.match('./index.html');
          }

          return caches.match(event.request, { ignoreSearch: true })
            .then((cachedResponse) => cachedResponse || Response.error());
        })
    );
  } else {
    // Cache-First for CDNs/Google Fonts
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => Response.error());
      })
    );
  }
});
