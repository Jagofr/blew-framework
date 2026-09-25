# Blew Framework Quick Start Guide 🍃

```
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

Welcome to Blew! This guide will take you from an empty directory to a functioning, standards-native Progressive Web App in under five minutes.

We will set up a zero-build project using native browser import maps, build a vertical feature slice with micro-signals and an offline-ready endpoint, and launch it using a static web server.

---

## 1. Prerequisites

Blew requires no bundlers, compilation steps, or local CLI toolchains to develop:

* **Evergreen Browser:** Modern Chromium (115+), Safari (17.4+), or Firefox (128+) supporting ES Modules, Import Maps, and standard Custom Elements.
* **Any Static HTTP Server:** `npx serve`, `bunx serve`, Python `http.server`, Caddy, or VS Code Live Server.
* **Node.js (v20+) or Bun (v1.0+):** Optional, only needed if you plan to run automated test harnesses or compile production release bundles later.

---

## 2. Project Directory Setup

Create an empty directory for your application and scaffold the basic folder layout:

```bash
mkdir my-blew-app
cd my-blew-app
mkdir -p src/core src/components src/features/counter
```

---

## 3. Application Shell (`index.html`)

Create `index.html` at the root of your project. This file configures the native browser Import Map, resolving `@blew/` and `@features/` aliases directly without requiring build-time plugins:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Blew Application</title>
  <link rel="stylesheet" href="/src/core/theme.css">

  <!-- Native Browser Import Map -->
  <script type="importmap">
  {
    "imports": {
      "@blew/core": "/src/core/element.js",
      "@blew/router": "/src/core/router.js",
      "@blew/api": "/src/core/api-router.js",
      "@blew/signals": "/src/core/signals.js",
      "@blew/router-utils": "/src/core/router-utils.js",
      "@blew/env": "/src/core/env.js",
      "@features/": "/src/features/",
      "@ui/": "/src/components/"
    }
  }
  </script>

  <script type="module" src="/src/app.js"></script>
</head>
<body>
  <header class="app-header">
    <h1>My Blew App</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/counter">Counter</a>
    </nav>
  </header>

  <!-- Router outlet where active views mount -->
  <main id="b-outlet"></main>
</body>
</html>
```

---

## 4. Theme & Reset Styles (`src/core/theme.css`)

Establish your global design tokens and cascade layers:

```css
/* src/core/theme.css */
@layer b-reset, b-tokens, b-layout;

@layer b-tokens {
  :root {
    --b-font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --b-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

    --b-color-surface: light-dark(#ffffff, #121212);
    --b-color-surface-elevated: light-dark(#f9fafb, #1e1e1e);
    --b-color-text: light-dark(#1f2937, #f3f4f6);
    --b-color-text-muted: light-dark(#6b7280, #9ca3af);
    --b-color-primary: #0070f3;
    --b-color-primary-hover: #005bb5;
    --b-color-border: light-dark(rgba(0, 0, 0, 0.12), rgba(255, 255, 255, 0.12));

    --b-radius-md: 8px;
    --b-space-sm: 0.5rem;
    --b-space-md: 1rem;
    --b-space-lg: 1.5rem;

    color-scheme: light dark;
  }
}

@layer b-reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: var(--b-font-sans);
    background-color: var(--b-color-surface);
    color: var(--b-color-text);
    line-height: 1.5;
    min-height: 100vh;
  }
}

@layer b-layout {
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--b-space-md) var(--b-space-lg);
    border-bottom: 1px solid var(--b-color-border);
  }
  .app-header nav a {
    margin-left: var(--b-space-md);
    color: var(--b-color-primary);
    text-decoration: none;
    font-weight: 500;
  }
  #b-outlet {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 var(--b-space-md);
  }
}
```

---

## 5. Building Your First Vertical Feature Slice

Let's build a self-contained feature slice in `src/features/counter/`:

```text
src/features/counter/
├── store.js          # Reactive micro-signal state
├── counter-view.js   # Custom element screen (<b-counter-view>)
└── endpoint.js       # Wildcard data endpoint (/api/counter/:action*)
```

### Step A: Reactive Store (`src/features/counter/store.js`)

```javascript
import { signal, computed } from '@blew/signals';

export const count = signal(0);
export const doubleCount = computed(() => count.value * 2);

export function increment() {
  count.update((n) => n + 1);
}

export function decrement() {
  count.update((n) => (n > 0 ? n - 1 : 0));
}

export function reset() {
  count.value = 0;
}
```

### Step B: UI Component (`src/features/counter/counter-view.js`)

```javascript
import { BlewElement } from '@blew/core';
import { count, doubleCount, increment, decrement, reset } from './store.js';

const styles = `
  :host {
    display: block;
    padding: var(--b-space-lg);
    background: var(--b-color-surface-elevated);
    border: 1px solid var(--b-color-border);
    border-radius: var(--b-radius-md);
    view-transition-name: counter-card;
  }

  @scope (:host) {
    h2 {
      margin-bottom: var(--b-space-sm);
    }
    .metrics {
      display: flex;
      gap: var(--b-space-lg);
      margin: var(--b-space-md) 0;
    }
    .button-group {
      display: flex;
      gap: var(--b-space-sm);
    }
    button {
      padding: 0.5rem 1rem;
      background: var(--b-color-primary);
      color: #ffffff;
      border: none;
      border-radius: var(--b-radius-md);
      font-weight: 600;
      cursor: pointer;
    }
    button.secondary {
      background: var(--b-color-border);
      color: var(--b-color-text);
    }
  }
`;

export class CounterView extends BlewElement {
  connectedCallback() {
    this.adoptStyles(styles);
    this.render();

    // Auto-update DOM nodes on signal changes
    const unsubscribe = count.subscribe((val) => {
      const valEl = this.shadowRoot.querySelector('#val');
      const dblEl = this.shadowRoot.querySelector('#dbl');
      if (valEl) valEl.textContent = String(val);
      if (dblEl) dblEl.textContent = String(doubleCount.value);
    });

    // Automatically unsubscribes on disconnectedCallback()
    this.subscribe(unsubscribe);
  }

  render() {
    const fragment = this.html`
      <section>
        <h2>Interactive Micro-Signals Counter</h2>
        <div class="metrics">
          <p>Count: <strong id="val">${count.value}</strong></p>
          <p>Doubled: <strong id="dbl">${doubleCount.value}</strong></p>
        </div>

        <div class="button-group">
          <button id="inc-btn">+ Increment</button>
          <button id="dec-btn" class="secondary">- Decrement</button>
          <button id="rst-btn" class="secondary">Reset</button>
        </div>
      </section>
    `;

    this.shadowRoot.replaceChildren(fragment);

    this.shadowRoot.querySelector('#inc-btn').onclick = increment;
    this.shadowRoot.querySelector('#dec-btn').onclick = decrement;
    this.shadowRoot.querySelector('#rst-btn').onclick = reset;
  }
}

customElements.define('b-counter-view', CounterView);
```

### Step C: Multi-Method Endpoint (`src/features/counter/endpoint.js`)

This endpoint runs identically on your production server and offline inside your Service Worker:

```javascript
import { count } from './store.js';

// GET /api/counter
export async function GET() {
  return Response.json({ count: count.value });
}

// POST /api/counter
export async function POST(request) {
  const data = await request.json();
  if (typeof data.value === 'number') {
    count.value = data.value;
  }
  return Response.json({ success: true, count: count.value });
}

// Named RPC Action: POST /api/counter/reset
export async function reset() {
  count.value = 0;
  return Response.json({ success: true, count: 0 });
}
```

---

## 6. Manifest Declaration (`src/routes.js`)

Pair your UI screen and API endpoint under a single feature block with an atomic kill-switch flag (`disabled`):

```javascript
// src/routes.js
export const features = [
  {
    name: 'home',
    view: {
      pattern: '/',
      tag: 'b-home-view',
      load: () => import('@features/home/home-view.js')
    }
  },
  {
    name: 'counter',
    disabled: false, // 👈 Setting this to true disables both the view and /api/counter
    view: {
      pattern: '/counter/:action*',
      tag: 'b-counter-view',
      load: () => import('@features/counter/counter-view.js')
    },
    api: {
      pattern: '/api/counter/:action*',
      load: () => import('@features/counter/endpoint.js')
    }
  }
];
```

---

## 7. App Bootstrap (`src/app.js`)

Mount the Navigation API router and register the offline Service Worker:

```javascript
// src/app.js
import { features } from './routes.js';
import { extractActiveRoutes } from '@blew/router-utils';
import { BlewRouter } from '@blew/router';

// 1. Ingest routes and filter out disabled features
const { views } = extractActiveRoutes(features);
const outlet = document.querySelector('#b-outlet');

// 2. Initialize router with automatic View Transitions
new BlewRouter(views, outlet, {
  enableTransitions: true
});

// 3. Register Service Worker for offline PWA support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { type: 'module' });
}
```

---

## 8. Run the Application

Launch any static HTTP server from the root of your project:

```bash
# Using npx
npx serve . -l 3000

# Or using Bun
bunx serve . -p 3000

# Or using Python
python3 -m http.server 3000
```

Open `http://localhost:3000` in your browser. You now have an active, uncompiled Progressive Web App with 0ms cold-start development, reactive micro-signals, and automated View Transitions.

---

## 9. Next Steps

* Dive into the complete [Canonical API Reference](./API.md).
* Explore the [Feature Slices & Wildcard API Engine Manual](./man/features.md).
* Read the [Styling Architecture & Scoping Manual](./man/styling.md).