# Blew Framework API Reference 🍃

```
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

Welcome to the canonical API reference for the Blew framework. Blew is engineered around browser-native primitives, modern Web Components, and ES module bare specifiers configured via native Import Maps.

---

## Table of Contents

1. [Module `@blew/core` (`BlewElement`)](#1-module-blewcore-blewelement)
2. [Module `@blew/signals` (Reactivity)](#2-module-blewsignals-reactivity)
3. [Module `@blew/router` (Client Navigation)](#3-module-blewrouter-client-navigation)
4. [Module `@blew/api` (Wildcard API Dispatcher)](#4-module-blewapi-wildcard-api-dispatcher)
5. [Module `@blew/router-utils` (Manifest Utilities)](#5-module-blewrouter-utils-manifest-utilities)
6. [Module `@blew/env` (Environment Detection)](#6-module-blewenv-environment-detection)
7. [Global Runtime Helpers (`Blew.*`)](#7-global-runtime-helpers-blew)

---

## 1. Module `@blew/core` (`BlewElement`)

**Import Specifier:** `@blew/core`  
**Source Path:** `src/core/element.js`

`BlewElement` is an ultra-lightweight ($< 1.5\text{ kB}$) base class extending the browser's native `HTMLElement`. It equips custom elements with Shadow DOM encapsulation, declarative Constructable Stylesheet ingestion, template caching, and automatic signal subscription management.

### Class Definition

```javascript
import { BlewElement } from '@blew/core';

export class MyCustomElement extends BlewElement {
  // Custom element implementation
}

customElements.define('b-my-element', MyCustomElement);
```

### Constructor Options

```typescript
constructor(options?: { mode?: 'open' | 'closed', delegatesFocus?: boolean })
```

* **`options.mode`** *(default: `'open'`)*: Encapsulation mode for `this.attachShadow()`.
* **`options.delegatesFocus`** *(default: `false`)*: Whether focus delegates to the first focusable child element when clicked.

### Instance Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `this.shadowRoot` | `ShadowRoot` | The attached shadow root of the element. |
| `this.params` | `Record<string, string>` | Dynamic route parameters injected by `BlewRouter` when mounted as an active screen view (e.g., `{ id: "42" }`). |

### Instance Methods

#### `this.adoptStyles(...styles: Array<string | CSSStyleSheet | CSSStyleSheet[]>): void`

Adopts stylesheets into `this.shadowRoot.adoptedStyleSheets`. Automatically prepends the global theme stylesheet (index $0$) and deduplicates incoming CSS strings using an internal shared `CSSStyleSheet` cache.

```javascript
const styles = `
  :host {
    display: block;
    padding: var(--b-space-md);
  }
  @scope (:host) {
    p {
      color: var(--b-color-text);
    }
  }
`;

class NoteCard extends BlewElement {
  connectedCallback() {
    this.adoptStyles(styles);
  }
}
```

#### `this.html(strings: TemplateStringsArray, ...values: unknown[]): DocumentFragment`

Tagged template literal helper that parses markup using an in-memory `<template>` cache and returns a cloned `DocumentFragment` (`template.content.cloneNode(true)`), avoiding repeated string parsing overhead.

```javascript
render() {
  const content = this.html`
    <article class="card">
      <h3>${this.title}</h3>
      <p>${this.content}</p>
    </article>
  `;
  this.shadowRoot.replaceChildren(content);
}
```

#### `this.subscribe(disposer: () => void): () => void`

Registers a cleanup or cancellation function. Every disposer registered via `subscribe()` is automatically invoked when `disconnectedCallback()` fires, preventing memory leaks from reactive signals, timers, or custom event listeners.

```javascript
connectedCallback() {
  const unsubscribe = countSignal.subscribe((val) => {
    const el = this.shadowRoot.querySelector('#count');
    if (el) el.textContent = String(val);
  });
  this.subscribe(unsubscribe);
}
```

#### `this.dispatch(eventName: string, detail?: unknown, options?: CustomEventInit): boolean`

Dispatches a standard `CustomEvent` configured by default with `bubbles: true`, `composed: true` (penetrates Shadow DOM boundaries), and `cancelable: true`.

```javascript
this.dispatch('b-note-deleted', { id: this.params.id });
```

---

## 2. Module `@blew/signals` (Reactivity)

**Import Specifier:** `@blew/signals`  
**Source Path:** `src/core/signals.js`

A high-performance, fine-grained micro-signals implementation aligned with the TC39 Signals proposal. State mutations schedule batched updates via native microtasks (`queueMicrotask`), eliminating redundant repaints without Virtual DOM diffing.

### Primitives

#### `signal<T>(initialValue: T): Signal<T>`

Creates a reactive state container with getter and setter access.

```javascript
import { signal } from '@blew/signals';

export const counter = signal(0);

// Read current value
console.log(counter.value); // 0

// Direct assignment
counter.value = 1;

// Functional mutation
counter.update((n) => n + 1);

// Subscribe to mutations
const unsubscribe = counter.subscribe((val) => {
  console.log('Value changed to:', val);
});
```

#### `computed<T>(fn: () => T): Computed<T>`

Creates a memoized, read-only signal derived from one or more upstream signals. The computation is evaluated lazily and cached until a dependency mutates.

```javascript
import { signal, computed } from '@blew/signals';

export const firstName = signal('Jane');
export const lastName = signal('Doe');
export const fullName = computed(() => `${firstName.value} ${lastName.value}`);
```

#### `effect(fn: () => void | (() => void)): () => void`

Executes a side-effect function immediately and tracks all reactive signals read during its execution. Automatically re-runs whenever any dependency changes. Returns an unsubscription / disposal function.

```javascript
import { effect } from '@blew/signals';

const stop = effect(() => {
  document.title = `Items count: ${counter.value}`;
});

// To dispose:
stop();
```

#### `batch(fn: () => void): void`

Defers change notifications across multiple signal writes, consolidating downstream computed values and effects into a single execution pass.

```javascript
import { batch } from '@blew/signals';

batch(() => {
  firstName.value = 'John';
  lastName.value = 'Smith';
}); // Downstream subscribers and effects trigger only once here
```

---

## 3. Module `@blew/router` (Client Navigation)

**Import Specifier:** `@blew/router`  
**Source Path:** `src/core/router.js`

Orchestrates client-side routing using the browser's native `Navigation API` and standard `URLPattern`. Integrates directly with the `View Transitions API` to provide direction-aware screen transitions without monkey-patching browser history.

### Class Definition

```javascript
import { BlewRouter } from '@blew/router';

const router = new BlewRouter(activeViews, document.querySelector('#b-outlet'), {
  fallbackTag: 'b-not-found-view',
  enableTransitions: true
});
```

### Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `routes` | `ViewRouteEntry[]` | *(required)* | Array of active view definitions. |
| `outlet` | `HTMLElement` | *(required)* | Target DOM container where route custom elements are mounted. |
| `options.fallbackTag` | `string` | `undefined` | Custom element tag name to mount when no `URLPattern` matches. |
| `options.enableTransitions` | `boolean` | `true` | Enables automatic `document.startViewTransition()` coordination. |

### Instance Methods

#### `router.navigate(url: string, options?: NavigationNavigateOptions): Promise<void>`

Triggers programmatic navigation through the native `window.navigation.navigate()` pipeline.

```javascript
await router.navigate('/notes/42', { state: { fromList: true } });
```

#### `router.match(pathname: string): { route: ViewRouteEntry, params: Record<string, string> } | null`

Tests a pathname against the registered route patterns using standard `new URLPattern({ pathname: route.pattern })`. Returns the matched route entry and extracted regex/wildcard tokens.

#### `router.currentEntry(): NavigationHistoryEntry | null`

Returns the active `NavigationHistoryEntry`, providing direct access to native state (`entry.getState()`) and history keys (`entry.key`).

---

## 4. Module `@blew/api` (Wildcard API Dispatcher)

**Import Specifier:** `@blew/api`  
**Source Path:** `src/core/api-router.js`

A universal HTTP dispatcher adhering to the WinterCG fetch specification (`Request` $\rightarrow$ `Response`). Executes identical route logic inside the client Service Worker (for offline PWA capabilities) and in server/edge environments (Node.js, Bun, Cloudflare Workers).

### Class Definition

```javascript
import { BlewApiRouter } from '@blew/api';

const api = new BlewApiRouter(activeApis);
```

### Dispatch Resolution Order

For any incoming `Request` matching a feature's wildcard route (`/api/:feature/:action*`):

1. **Named Action Export:** Extracts the first segment of `:action` and converts kebab-case to camelCase (e.g., `archive-note` $\rightarrow$ `archiveNote`). If an exported function matches that name, Blew executes it:
   ```typescript
   export async function archiveNote(request: Request, context: ApiContext): Promise<Response>
   ```

2. **HTTP Verb Export:** If no named action matches, Blew delegates to the exported HTTP verb function corresponding to `request.method`:
   ```typescript
   export async function GET(request: Request, context: ApiContext): Promise<Response>
   export async function POST(request: Request, context: ApiContext): Promise<Response>
   export async function PATCH(request: Request, context: ApiContext): Promise<Response>
   export async function DELETE(request: Request, context: ApiContext): Promise<Response>
   ```

3. **405 Method Not Allowed:** If no verb handler exists for the requested method, Blew returns a standard `405 Method Not Allowed` Response.

### The `ApiContext` Object

Every endpoint handler receives a context object as its second parameter:

```typescript
interface ApiContext {
  params: Record<string, string>; // Matched URLPattern tokens (e.g., params.action)
  url: URL;                       // Fully parsed URL object including searchParams
}
```

---

## 5. Module `@blew/router-utils` (Manifest Utilities)

**Import Specifier:** `@blew/router-utils`  
**Source Path:** `src/core/router-utils.js`

Provides manifest ingestion and atomic feature-flag normalization.

### Functions

#### `extractActiveRoutes(featureList: FeatureModuleDefinition[]): { views: ViewRouteEntry[], apis: ApiRouteEntry[] }`

Parses the nested `features` array from `src/routes.js`. Filters out any feature module marked `disabled: true` and flattens active UI views and API endpoints into dedicated arrays for the respective routers.

```javascript
import { features } from './src/routes.js';
import { extractActiveRoutes } from '@blew/router-utils';

const { views, apis } = extractActiveRoutes(features);
```

### Feature Module Schema

```typescript
interface FeatureModuleDefinition {
  name: string;
  disabled?: boolean;
  view?: {
    pattern: string;
    tag: string;
    load: () => Promise<unknown>;
  };
  api?: {
    pattern: string;
    load: () => Promise<unknown>;
  };
}
```

---

## 6. Module `@blew/env` (Environment Detection)

**Import Specifier:** `@blew/env`  
**Source Path:** `src/core/env.js`

A zero-overhead environment detector providing uniform status across unbundled browser runtimes and compiled production artifacts.

### API Interface

```javascript
import { ENV } from '@blew/env';

if (ENV.isDev()) {
  console.info('Running in unbundled development mode');
}

if (ENV.isProd()) {
  // Production-only optimizations
}
```

| Method / Property | Return Type | Description |
| :--- | :--- | :--- |
| `ENV.mode` | `'development' \| 'production'` | Current execution mode resolved from `window.__APP_ENV__` or `process.env.NODE_ENV`. |
| `ENV.isProd()` | `boolean` | Returns `true` when operating under production mode. |
| `ENV.isDev()` | `boolean` | Returns `true` when operating under development mode. |

---

## 7. Global Runtime Helpers (`Blew.*`)

The global `window.Blew` namespace exposes ergonomics for hardware APIs, navigation shortcuts, and PWA capabilities.

### Navigation Shortcuts

```javascript
// Programmatic routing shortcut
Blew.navigate('/notes/new');

// History traversal
Blew.back();
Blew.forward();
```

### Web Badging API (`Blew.badge`)

```javascript
// Set numeric app badge on device home screen or dock
await Blew.badge.set(5);

// Clear app badge
await Blew.badge.clear();
```

### Native OS Share Sheet (`Blew.share`)

```javascript
await Blew.share({
  title: 'Blew Framework',
  text: 'Standards-native PWA development without build tools.',
  url: 'https://blew.jagofr.xyz'
});
```

### Top-Layer Dialog Helper (`Blew.dialog`)

```javascript
// Opens a native <dialog> or popover element by selector or ID
Blew.dialog.showModal('#note-compose-dialog');

// Closes active top-layer modal
Blew.dialog.close('#note-compose-dialog');
```