export class BlewRouter {
constructor(routes, outlet, options = {}) {
this.routes = Array.isArray(routes) ? routes : [];
this.outlet = outlet;
this.options = {
enableTransitions: true,
...options
};
this._compiledRoutes = [];
this._currentIndex = 0;
this._fallbackEntry = null;
this._compileRoutes();
if (typeof window !== 'undefined') {
this._setupNavigationListener();
this._resolveCurrentLocation();
}
}
_compileRoutes() {
if (typeof URLPattern === 'undefined') return;
this._compiledRoutes = this.routes.map((route) => {
const pattern = new URLPattern({ pathname: route.pattern });
return { pattern, route };
});
}
_setupNavigationListener() {
if ('navigation' in window && window.navigation) {
this._currentIndex = window.navigation.currentEntry?.index ?? 0;
window.navigation.addEventListener('navigate', (event) => {
if (!event.canIntercept || event.downloadRequest || event.formData) {
return;
}
const url = new URL(event.destination.url);
if (url.origin !== window.location.origin) {
return;
}
let vector = 'b-nav-forward';
if (event.navigationType === 'replace') {
vector = 'b-nav-replace';
} else if (event.destination.index !== -1) {
if (event.destination.index < this._currentIndex) {
vector = 'b-nav-backward';
} else if (event.destination.index > this._currentIndex) {
vector = 'b-nav-forward';
}
this._currentIndex = event.destination.index;
}
event.intercept({
handler: async () => {
await this._handleTransition(url.pathname, vector);
}
});
});
} else {
window.addEventListener('popstate', (event) => {
const url = new URL(window.location.href);
this._fallbackEntry = {
getState: () => event.state,
key: String(Date.now())
};
this._handleTransition(url.pathname, 'b-nav-backward');
});
document.addEventListener('click', (event) => {
const target = event.target;
if (!(target instanceof Element)) return;
const anchor = target.closest('a');
if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
const href = anchor.getAttribute('href');
if (!href || href.startsWith('http') || href.startsWith('
event.preventDefault();
this.navigate(href);
});
}
}
async _resolveCurrentLocation() {
if (typeof window === 'undefined') return;
const pathname = window.location.pathname;
await this._handleTransition(pathname, 'b-nav-replace');
}
async _handleTransition(pathname, vector) {
const match = this.match(pathname);
const mountTask = async () => {
if (!this.outlet) return;
if (match) {
if (typeof match.route.load === 'function') {
await match.route.load();
}
const viewElement = document.createElement(match.route.tag);
(viewElement).params = match.params;
this.outlet.replaceChildren(viewElement);
} else if (this.options.fallbackTag) {
const fallbackElement = document.createElement(this.options.fallbackTag);
this.outlet.replaceChildren(fallbackElement);
} else {
const notFound = document.createElement('div');
notFound.className = 'b-not-found';
notFound.textContent = '404 - Page Not Found';
this.outlet.replaceChildren(notFound);
}
};
if (
this.options.enableTransitions &&
typeof document !== 'undefined' &&
'startViewTransition' in document &&
typeof document.startViewTransition === 'function'
) {
const root = document.documentElement;
root.classList.remove('b-nav-forward', 'b-nav-backward', 'b-nav-replace');
root.classList.add(vector);
try {
const transition = document.startViewTransition(mountTask);
await transition.finished;
} finally {
root.classList.remove(vector);
}
} else {
await mountTask();
}
}
match(pathname) {
if (typeof URLPattern === 'undefined') {
return null;
}
const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
for (const { pattern, route } of this._compiledRoutes) {
const result = pattern.exec({ pathname: normalizedPath });
if (result) {
const params = {};
const pathnameGroups = result.pathname?.groups || {};
for (const [key, value] of Object.entries(pathnameGroups)) {
if (value !== undefined) {
params[key] = value;
}
}
return { route, params };
}
}
return null;
}
async navigate(url, options = {}) {
if (typeof window === 'undefined') return;
if ('navigation' in window && window.navigation && typeof window.navigation.navigate === 'function') {
try {
window.navigation.navigate(url, options);
return;
} catch (err) {
console.warn('Navigation API navigate failed, falling back to history:', err);
}
}
window.history.pushState(options.state ?? null, '', url);
this._fallbackEntry = {
getState: () => options.state ?? null,
key: String(Date.now())
};
const parsed = new URL(url, window.location.origin);
await this._handleTransition(parsed.pathname, 'b-nav-forward');
}
currentEntry() {
if (typeof window !== 'undefined' && 'navigation' in window && window.navigation) {
return window.navigation.currentEntry;
}
return this._fallbackEntry;
}
}