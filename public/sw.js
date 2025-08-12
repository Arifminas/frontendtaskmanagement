const CACHE_NAME = 'task-app-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  // Add other static assets or build files here
];

// Install event - cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(ASSETS.map(url => cache.add(url))))
      .then(() => self.skipWaiting()) // Activate worker immediately after install
  );
});

// Activate event - cleanup old caches if any
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim()) // Take control of pages ASAP
  );
});

// Fetch event - respond with cache first, fallback to network
self.addEventListener('fetch', event => {
  // Ignore requests with unsupported schemes like chrome-extension://
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then(networkResponse => {
            if (
              event.request.method === 'GET' &&
              networkResponse.status === 200 &&
              networkResponse.type === 'basic'
            ) {
              const clonedResponse = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, clonedResponse);
              });
            }
            return networkResponse;
          });
      })
      .catch(() => {
        // Optionally respond with a fallback offline page/image if network and cache both fail
        // return caches.match('/offline.html');
      })
  );
});
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const title = payload.title || 'Notification';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/badge.png',
    data: payload.data || {},
    tag: payload.data?.notificationId || undefined,
    renotify: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.link || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});