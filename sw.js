const cacheName = 'PWAv12';
const filesToCache = [
  '/',
  '/index.html',
  '/js/app.js'
];

self.addEventListener('install', event => {
  console.log('ServiceWorker install event - skip waiting');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('install', event => {
  console.log('ServiceWorker install event - cache files');
  event.waitUntil(cacheFiles(event));
});

// self.addEventListener('activate', event => {
//   console.log('ServiceWorker activate event - claim');
//   event.waitUntil(self.clients.claim());
// });

self.addEventListener('fetch', event => {
  console.log('Handle new request', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// push support
self.addEventListener('message', event => {
  const {data} = event;
  if (data.type === 'showPush') {
    showPushNotification(data.message);
  }
});

self.onnotificationclick = event => {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  // This looks to see if the current url is already open and
  // focuses if it is
  // event.waitUntil(
  //   clients.matchAll({
  //     type: "window"
  //   })
  //   .then(clientList => {
  //     for (let i = 0; i < clientList.length; i++) {
  //       const client = clientList[i];
  //       console.log(client);
  //       // if (client.url == '/' && 'focus' in client)
  //       //   return client.focus();
  //       if (client.visibilityState === 'hidden') {
  //         return client.focus();
  //       }
  //     }
  //     if (clients.openWindow) {
  //       return clients.openWindow(client.url);
  //     }
  //   }));
};

function cacheFiles() {
  return caches.open(cacheName)
    .then(cache => {
      console.log('ServiceWorker caching...');
      return cache.addAll(filesToCache);
    });
}

function showPushNotification(body) {
  self.registration.showNotification('New info', {
    lang: 'pl',
    body: body,
    icon: 'launcher-icon.png',
    actions: [
      {
        action: 'openapp',
        title: 'Open app',
        // icon: 'someicon1.png'
      }
    ]
  });
}

