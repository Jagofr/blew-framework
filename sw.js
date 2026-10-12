import { features } from './src/routes.js';
import { extractActiveRoutes } from './src/core/router-utils.js';
import { BlewApiRouter } from './src/core/api-router.js';
export const VERSION = '0.1.0 ALPHA (BUILD 0001)';
export const CACHE_NAME = `blew-cache-0.1.0-alpha.build-0001`;
const PRECACHE_ASSETS = [
'/',
'/index.html',
'/manifest.webmanifest',
'/src/app.js',
'/src/routes.js',
'/src/core/theme.css',
'/src/core/element.js',
'/src/core/signals.js',
'/src/core/router.js',
'/src/core/api-router.js',
'/src/core/router-utils.js',
'/src/core/env.js',
'/src/core/global.js',
'/src/components/b-shell.js',
'/src/components/b-dialog.js',
'/src/features/home/home-view.js',
'/src/features/counter/store.js',
'/src/features/counter/counter-view.js',
'/src/features/counter/endpoint.js',
'/src/features/notes/notes.css',
'/src/features/notes/store.js',
'/src/features/notes/notes-view.js',
'/src/features/notes/endpoint.js'
];
const { apis } = extractActiveRoutes(features);
const offlineApiRouter = new BlewApiRouter(apis);
const swGlobal = typeof self !== 'undefined' ? self : null;
if (swGlobal && typeof swGlobal.addEventListener === 'function') {
swGlobal.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return cache.addAll(PRECACHE_ASSETS).catch((err) => {
console.warn('Precache partial failure (acceptable in development):', err);
});
}).then(() => swGlobal.skipWaiting())
);
});
swGlobal.addEventListener('activate', (event) => {
event.waitUntil(
caches.keys().then((keys) => {
return Promise.all(
keys.map((key) => {
if (key !== CACHE_NAME) {
return caches.delete(key);
}
})
);
}).then(() => swGlobal.clients.claim())
);
});
swGlobal.addEventListener('fetch', (event) => {
const request = event.request;
const url = new URL(request.url);
if (url.pathname.startsWith('/api/')) {
event.respondWith(
fetch(request).catch(async () => {
return offlineApiRouter.handle(request);
})
);
return;
}
if (url.pathname.includes('/chunks/')) {
event.respondWith(
caches.match(request).then((cached) => {
return cached || fetch(request).then((res) => {
if (res.ok) {
const copy = res.clone();
caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
}
return res;
});
})
);
return;
}
event.respondWith(
caches.match(request).then((cachedResponse) => {
const fetchPromise = fetch(request)
.then((networkResponse) => {
if (networkResponse && networkResponse.ok) {
const responseClone = networkResponse.clone();
caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
}
return networkResponse;
})
.catch(() => {
if (request.mode === 'navigate') {
return caches.match('/index.html');
}
return cachedResponse;
});
return cachedResponse || fetchPromise;
})
);
});
}