const cacheName = 'PWAv4';
const filesToCache = [
  '/',
  '/index.html',
  '/js/app.js'
];

self.addEventListener('install', event => {
  console.log('ServiceWorker install event');
  event.waitUntil(() => {
    cacheFiles(event);
    self.skipWaiting();
  });
});

self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener('fetch', event => {
  console.log('Handle request', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

const cacheFiles = () => {
  return caches.open(cacheName)
    .then(cache => {
      console.log('ServiceWorker caching...');
      return cache.addAll(filesToCache);
    });
};
