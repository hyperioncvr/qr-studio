const CACHE_NAME = 'qr-studio-v1.3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
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
  './locales/ar.json',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js'
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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
