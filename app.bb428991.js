import { features } from './routes.js';
import { extractActiveRoutes } from './core/router-utils.js';
import { BlewRouter } from './core/router.js';
import { Blew } from './core/global.js';
import './components/b-shell.js';
import './components/b-dialog.js';
export const { views, apis } = extractActiveRoutes(features);
export let router = null;
export function bootstrap() {
if (typeof document === 'undefined') return null;
const outlet = document.querySelector('#b-outlet');
router = new BlewRouter(views, outlet, {
enableTransitions: true,
fallbackTag: 'b-home-view'
});
Blew.setRouter(router);
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
window.addEventListener('load', () => {
navigator.serviceWorker
.register('/sw.js', { type: 'module' })
.then((reg) => {
console.info('Blew Service Worker active with scope:', reg.scope);
})
.catch((err) => {
console.warn('Blew Service Worker registration skipped:', err);
});
});
}
return router;
}
if (typeof document !== 'undefined') {
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => bootstrap());
} else {
bootstrap();
}
}
export { Blew };