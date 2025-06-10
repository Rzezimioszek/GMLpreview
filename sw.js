const CACHE_NAME = 'gml-cache-v1';
const URLS_TO_CACHE = [
  '/index.html',
  '/app.js',
  '/style.css',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
    console.log('Service Worker zainstalowany');
    self.skipWaiting();
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
      );
  });
  