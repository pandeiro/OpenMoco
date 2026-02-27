const CACHE_NAME = 'openmoko-init-v1';
const ASSETS_TO_CACHE = [
    '/init/',
    '/init/index.html',
    '/init/manifest.json',
];

// Check if we're in development mode
const isDevMode = self.location.hostname === 'localhost' || 
                  self.location.hostname === '127.0.0.1' ||
                  self.location.port === '5173'; // Vite dev server port

if (isDevMode) {
    console.log('[SW] Dev mode detected - caching disabled');
}

self.addEventListener('install', (event) => {
    if (isDevMode) {
        self.skipWaiting();
        return;
    }
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    if (isDevMode) {
        // Clear all caches in dev mode
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
        self.clients.claim();
        return;
    }
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // In dev mode: just pass through all requests
    if (isDevMode) {
        return;
    }
    
    // Only cache GET requests from our own origin
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                // Don't cache API calls or dynamic routes
                if (event.request.url.includes('/api/') || event.request.url.includes('/webhooks/')) {
                    return fetchResponse;
                }
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        })
    );
});

self.addEventListener('push', (event) => {
    const data = event.data?.json() || { title: 'OpenMoko', body: 'New update available' };

    const options = {
        body: data.body,
        icon: '/init/icons/icon-192.png',
        badge: '/init/icons/icon-192.png',
        data: data.data,
        vibrate: [100, 50, 100],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/init/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
