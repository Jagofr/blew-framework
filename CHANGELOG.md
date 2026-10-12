# Blew Framework Changelog 🍃

All notable changes to the Blew framework will be documented in this file.

The versioning format adheres strictly to:
`MAJOR.MINOR.PATCH BUILD-TYPE (BUILD 0000)`
*(Canonical semantic identifier: `0.1.0-alpha.build-0002`)*

---

## [0.1.0 ALPHA (BUILD 0002)] - 2026-10-12

### 🛠️ GitHub Pages (`gh-pages`) & Subpath Deployment Compatibility

#### Core Router & API Enhancements
* **`@blew/router` (`BlewRouter`):**
  * Added `_detectBase()` to automatically infer subpath prefixes from `<base href>` or `*.github.io` repository URLs.
  * Added base-path stripping and prefixing in `match()` and `navigate()` for seamless subpath navigation.
  * Added Shadow DOM-aware link click interception using `event.composedPath()`.
  * Added automatic SPA deep-link restoration on load from `sessionStorage.getItem('blew_redirect_path')`.
* **`@blew/api` (`BlewApiRouter`):**
  * Normalized request pathnames to resolve `/api/*` endpoints identically whether hosted at domain root or under a repository subpath.

#### Build Pipeline & PWA Packaging (`build.js`, `sw.js`, `manifest.webmanifest`)
* **Relative Asset & Import Map Generation:**
  * Updated `dist/index.html` to emit relative `./` paths for stylesheets, entry scripts, manifest, and import map specifiers (`./chunks/...`).
  * Rewrote relative module imports across all bundled UI components, feature slices, routes, and core chunks to resolve directly to hashed chunk filenames.
* **GitHub Pages Static Hosting Artifacts:**
  * Emitted `dist/.nojekyll` to bypass Jekyll asset filtering on GitHub Pages.
  * Emitted `dist/404.html` with SPA path capture and redirect back to the repository root.
* **Service Worker & Manifest Subpath Support:**
  * Updated `src/app.js` to register `./sw.js` with relative scope.
  * Updated `build.js` to inject the exact production chunk list into `dist/sw.js` `PRECACHE_ASSETS`.
  * Updated `manifest.webmanifest` `start_url` and `scope` to `"./"`.

---

## [0.1.0 ALPHA (BUILD 0001)] - 2026-10-12

### 🚀 Initial Foundation Release

#### Architectural Features & Core Engine
* **`@blew/core` (`BlewElement`):**
  * Sub-1.5 kB base custom element extending `HTMLElement`.
  * Open Shadow DOM encapsulation with Constructable Stylesheet caching (`StyleSheetCache`).
  * In-memory `<template>` caching and cloning via tagged literal `this.html`.
  * Automatic lifecycle cleanup registry (`this.subscribe()`) linked directly to `disconnectedCallback()`.
  * Standardized event bubbling helper (`this.dispatch()`) with composed penetration.
* **`@blew/signals` (Reactivity Engine):**
  * Fine-grained TC39 Signals-aligned micro-reactivity: `signal()`, `computed()`, `effect()`, and `batch()`.
  * Lazy evaluated, memoized derivations.
  * Dependency graph tracking and microtask-friendly batched subscriber flushes.
* **`@blew/router` (Client Navigation):**
  * Interception and routing via W3C Navigation API (`window.navigation`) with Safari/Gecko fallbacks.
  * Declarative route matching via WHATWG `URLPattern`.
  * Direction-aware View Transitions orchestrator assigning `.b-nav-forward`, `.b-nav-backward`, and `.b-nav-replace`.
  * State preservation backed by `NavigationHistoryEntry`.
* **`@blew/api` (Universal WinterCG Dispatcher):**
  * Universal `Request` $\rightarrow$ `Response` wildcard dispatcher (`/api/:feature/:action*`).
  * Strict resolution order: Named Action export (camelCase) $\rightarrow$ HTTP verb export $\rightarrow$ 405 Method Not Allowed $\rightarrow$ 404 Not Found.
* **`@blew/router-utils` (Manifest Utilities):**
  * Manifest ingestion and atomic feature-flag normalization (`extractActiveRoutes`).
  * Dynamic pruning of feature slices marked `disabled: true`.
* **`@blew/env` (Environment Detection):**
  * Zero-overhead runtime environment bridge inspecting `window.__APP_ENV__` and `process.env.NODE_ENV`.
* **Global Helpers (`window.Blew`):**
  * Navigation helpers: `Blew.navigate()`, `Blew.back()`, `Blew.forward()`.
  * Hardware & PWA ergonomics: `Blew.badge.set()`, `Blew.badge.clear()`, `Blew.share()`.
  * Top-layer dialog management: `Blew.dialog.showModal()`, `Blew.dialog.close()`.

#### UI Shell & Vertical Feature Slices
* **Reusable Components:**
  * `<b-shell>`: Responsive app frame with sticky header, navigation, and slotted view container.
  * `<b-dialog>`: Top-layer modal dialog wrapper built on native `<dialog>` and popover standard.
* **Vertical Feature Slices:**
  * `src/features/home/`: Landing screen (`<b-home-view>`) with live architectural telemetry.
  * `src/features/counter/`: Micro-signals counter slice with reactive store (`store.js`), custom element (`<b-counter-view>`), and WinterCG endpoint (`endpoint.js`).
  * `src/features/notes/`: Master-detail notes slice with scoped stylesheet (`notes.css`), signal store (`store.js`), UI custom element (`<b-notes-view>`), and multi-method / RPC data endpoint (`endpoint.js`).
  * `src/features/ai-summary/`: Dark-launched slice demonstrating atomic feature-flag pruning.

#### Progressive Web App & Production Tooling
* **ESM Service Worker (`sw.js`):**
  * Multi-tier caching architecture (Precache, Cache-First for chunks, Stale-While-Revalidate).
  * Direct offline execution of wildcard endpoints via `BlewApiRouter`.
* **Headless Production Bundler (`build.js`):**
  * Zero-dependency compilation producing content-hashed chunks (`dist/chunks/[name].[hash].js`).
  * Dead code elimination for disabled features.
  * Injected production import map in `dist/index.html`.
  * Verified core engine payload budget: **3.33 kB** Brotli (under the 5 kB target).

#### Testing Suite
* Comprehensive unit tests across all core modules and reactive stores (`tests/unit/`).
* Robust end-to-end integration tests for routing, API dispatching, feature flags, service worker, and build pipelines (`tests/e2e/`).
* 61/61 passing tests with 0 external test dependencies using Node native test runner.

