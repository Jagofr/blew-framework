import { BlewElement } from '../../core/element.js';
const homeStyles = `
:host {
display: block;
view-transition-name: feature-home;
}
@scope (:host) {
.hero {
text-align: center;
padding: var(--b-space-xl) var(--b-space-md);
background: var(--b-color-surface-elevated);
border: 1px solid var(--b-color-border);
border-radius: var(--b-radius-lg);
margin-bottom: var(--b-space-xl);
}
.hero h2 {
font-size: 2.25rem;
margin-bottom: var(--b-space-sm);
letter-spacing: -0.02em;
}
.hero p {
font-size: 1.15rem;
color: var(--b-color-text-muted);
max-width: 650px;
margin: 0 auto var(--b-space-lg);
}
.hero-actions {
display: flex;
justify-content: center;
gap: var(--b-space-md);
}
.btn {
display: inline-block;
padding: 0.65rem 1.25rem;
font-weight: 600;
border-radius: var(--b-radius-md);
text-decoration: none;
transition: background-color var(--b-transition-fast), transform var(--b-transition-fast);
}
.btn-primary {
background: var(--b-color-primary);
color: #ffffff;
}
.btn-primary:hover {
background: var(--b-color-primary-hover);
color: #ffffff;
transform: translateY(-1px);
}
.btn-secondary {
background: var(--b-color-surface);
color: var(--b-color-text);
border: 1px solid var(--b-color-border);
}
.btn-secondary:hover {
background: var(--b-color-surface-sunken);
transform: translateY(-1px);
}
.features-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
gap: var(--b-space-lg);
margin-top: var(--b-space-xl);
}
.card {
padding: var(--b-space-lg);
background: var(--b-color-surface);
border: 1px solid var(--b-color-border);
border-radius: var(--b-radius-md);
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}
.card h3 {
font-size: 1.1rem;
margin-bottom: var(--b-space-xs);
color: var(--b-color-text);
}
.card p {
font-size: 0.95rem;
color: var(--b-color-text-muted);
line-height: 1.5;
}
}
`;
export class HomeView extends BlewElement {
connectedCallback() {
this.adoptStyles(homeStyles);
this.render();
}
render() {
const fragment = this.html`
<div class="hero">
<h2>A Breezy, Standards-Native PWA Framework 🍃</h2>
<p>
Zero build step. Zero dependencies. Sub-5KB core.
Built directly atop native Import Maps, Web Components, and View Transitions.
</p>
<div class="hero-actions">
<a href="/counter" class="btn btn-primary" b-link>Explore Counter Demo</a>
<a href="/notes" class="btn btn-secondary" b-link>Explore Notes Slice</a>
</div>
</div>
<section class="features-grid">
<article class="card">
<h3>⚡ 0ms Cold Start</h3>
<p>Launch any static file server and code directly with native ES modules and import maps. No file watchers required.</p>
</article>
<article class="card">
<h3>🎯 Micro-Signals Reactivity</h3>
<p>TC39-aligned fine-grained reactive primitives with microtask batching. Zero Virtual DOM diffing overhead.</p>
</article>
<article class="card">
<h3>🧭 Navigation & Transitions</h3>
<p>Modern routing built atop window.navigation and URLPattern with automated direction-aware view transitions.</p>
</article>
<article class="card">
<h3>📦 Vertical Feature Slices</h3>
<p>UI custom elements, scoped stylesheets, signal stores, and WinterCG endpoints co-located under src/features/.</p>
</article>
</section>
`;
this.shadowRoot.replaceChildren(fragment);
}
}
if (typeof customElements !== 'undefined' && !customElements.get('b-home-view')) {
customElements.define('b-home-view', HomeView);
}