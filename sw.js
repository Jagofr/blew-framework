import { features } from './routes.js';import { extractActiveRoutes } from './chunks/router-utils.50e0d71e.js';import { BlewApiRouter } from './chunks/api-router.8d887801.js';export const VERSION = '0.1.0 ALPHA (BUILD 0002)';export const CACHE_NAME = 'blew-cache-0.1.0-alpha.build-0002';const PRECACHE_ASSETS = [
"./",
"./index.html",
"./manifest.webmanifest",
"./theme.962df09d.css",
"./app.72e9916a.js",
"./routes.js",
"./chunks/element.25e106f5.js",
"./chunks/signals.684c23d4.js",
"./chunks/api-router.8d887801.js",
"./chunks/router-utils.50e0d71e.js",
"./chunks/env.e38ca371.js",
"./chunks/router.9600b0dc.js",
"./chunks/global.436afaba.js",
"./chunks/ui/b-dialog.js",
"./chunks/ui/b-shell.js",
"./chunks/features/counter/counter-view.js",
"./chunks/features/counter/endpoint.js",
"./chunks/features/counter/store.js",
"./chunks/features/home/home-view.js",
"./chunks/features/notes/endpoint.js",
"./chunks/features/notes/notes-view.js",
"./chunks/features/notes/notes.css",
"./chunks/features/notes/store.js"
];const { apis } = extractActiveRoutes(features);const offlineApiRouter = new BlewApiRouter(apis);const swGlobal = typeof self !== 'undefined' ? self : null;if (swGlobal && typeof swGlobal.addEventListener === 'function') {swGlobal.addEventListener('install', (event) => {event.waitUntil(caches.open(CACHE_NAME).then((cache) => {return cache.addAll(PRECACHE_ASSETS).catch((err) => {console.warn('Precache partial failure (acceptable in development):', err);});}).then(() => swGlobal.skipWaiting()));});swGlobal.addEventListener('activate', (event) => {event.waitUntil(caches.keys().then((keys) => {return Promise.all(keys.map((key) => {if (key !== CACHE_NAME) {return caches.delete(key);}}));}).then(() => swGlobal.clients.claim()));});swGlobal.addEventListener('fetch', (event) => {const request = event.request;const url = new URL(request.url);if (url.pathname.includes('/api/')) {event.respondWith(fetch(request).catch(async () => {return offlineApiRouter.handle(request);}));return;}if (url.pathname.includes('/chunks/')) {event.respondWith(caches.match(request).then((cached) => {return cached || fetch(request).then((res) => {if (res.ok) {const copy = res.clone();caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));}return res;});}));return;}event.respondWith(caches.match(request).then((cachedResponse) => {const fetchPromise = fetch(request).then((networkResponse) => {if (networkResponse && networkResponse.ok) {const responseClone = networkResponse.clone();caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));}return networkResponse;}).catch(async () => {if (request.mode === 'navigate') {return (await caches.match('./index.html')) || (await caches.match('/index.html')) || cachedResponse;}return cachedResponse;});return cachedResponse || fetchPromise;}));});}