# Blew Granular Changelog: 0.1.0 ALPHA (BUILD 0001) 🍃

```
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

* **Version Tag:** `0.1.0-alpha.build-0001`
* **Semantic Display Format:** `0.1.0 ALPHA (BUILD 0001)`
* **Release Date:** 2026-10-12
* **Build Target:** Modern Evergreen Browsers (Chromium 115+, Safari 17.4+, Firefox 128+)
* **Core Payload Size:** 3.33 kB Brotli (sub-5 kB budget PASSED)

---

## 1. Summary of Deliverables

This milestone delivers the initial foundational architecture for Blew: a standards-native, zero-dependency Progressive Web Application (PWA) framework engineered directly atop modern web platform primitives.

---

## 2. Granular Module Specifications

### `@blew/core` (`src/core/element.js`)
* Implemented `BlewElement` extending `HTMLElement`.
* Constructor automatically attaches open Shadow DOM with configurable `delegatesFocus`.
* Injected `this.params` record populated by router.
* Constructable Stylesheet ingestion (`this.adoptStyles()`) with global theme pre-adoption at index 0 and content-hashed singleton caching (`StyleSheetCache`).
* In-memory `<template>` cloning parser via tagged template `this.html`.
* Auto-disposal subscription manager (`this.subscribe()`) invoked on `disconnectedCallback()`.
* Event dispatcher (`this.dispatch()`) configured with `bubbles: true`, `composed: true`, `cancelable: true`.

### `@blew/signals` (`src/core/signals.js`)
* `signal(initialValue)`: mutable signal with getter/setter, `.update(fn)`, and `.subscribe(fn)`.
* `computed(fn)`: lazy memoized derivation with automated upstream dependency tracking and dirty invalidation.
* `effect(fn)`: side-effect scheduler with active dependency tracking and return cleanup disposer support.
* `batch(fn)`: atomic transaction wrapper consolidating multiple signal writes and deduplicating subscriber notifications.

### `@blew/router` (`src/core/router.js`)
* Integration with native W3C Navigation API (`window.navigation.addEventListener('navigate')`).
* Fallback click interception and `popstate` listening for non-supporting browsers.
* Route resolution via WHATWG `URLPattern` matching.
* Direction-aware View Transitions orchestrator assigning `.b-nav-forward`, `.b-nav-backward`, or `.b-nav-replace`.
* State and history access via `router.currentEntry()`.

### `@blew/api` (`src/core/api-router.js`)
* WinterCG compliant HTTP dispatcher handling `Request` $\rightarrow$ `Response`.
* Wildcard matching via `URLPattern` (`/api/:feature/:action*`).
* Resolution order:
  1. Named RPC Action export (kebab-case $\rightarrow$ camelCase).
  2. HTTP verb export (`GET`, `POST`, `PATCH`, `DELETE`).
  3. 405 Method Not Allowed.
  4. 404 Not Found.
* Context passing with `context.params` and `context.url`.

### `@blew/router-utils` (`src/core/router-utils.js`)
* Manifest parser normalizing `src/routes.js`.
* Filters out feature modules marked `disabled: true` across UI views and API endpoints.

### `@blew/env` (`src/core/env.js`)
* Unified environment bridge detecting `globalThis.__APP_ENV__` and `process.env.NODE_ENV`.
* Exposes `ENV.mode`, `ENV.isDev()`, and `ENV.isProd()`.

### Global API (`src/core/global.js`)
* Registered on `window.Blew` and exportable as module:
  * `Blew.navigate(url, options)`, `Blew.back()`, `Blew.forward()`.
  * `Blew.badge.set(count)`, `Blew.badge.clear()`.
  * `Blew.share(data)`.
  * `Blew.dialog.showModal(selector)`, `Blew.dialog.close(selector)`.
  * `Blew.getThemeSheet()`.

---

## 3. UI Shell & Feature Slices

* **`<b-shell>` (`src/components/b-shell.js`):** Responsive application shell with sticky header, branding, navigation links, and slotted content container.
* **`<b-dialog>` (`src/components/b-dialog.js`):** Native modal dialog wrapper with top-layer promotion, backdrop blur, light-dismissal, and custom events.
* **`src/features/home/`:** `<b-home-view>` landing screen with feature highlights and navigation actions.
* **`src/features/counter/`:** Micro-signals reactive counter view (`<b-counter-view>`), state store (`store.js`), and WinterCG data endpoint (`endpoint.js`).
* **`src/features/notes/`:** Master-detail notes feature with scoped CSS (`notes.css`), reactive store (`store.js`), UI custom element (`<b-notes-view>`), and REST / RPC data endpoint (`endpoint.js`).

---

## 4. PWA & Headless Compiler

* **`sw.js`:** ESM Service Worker with multi-tier caching (Precache, Cache-First for content-hashed chunks, Stale-While-Revalidate) and offline execution of wildcard endpoints via `BlewApiRouter`.
* **`manifest.webmanifest`:** PWA manifest declaring application identity and version `0.1.0 ALPHA (BUILD 0001)`.
* **`build.js`:** Headless production bundler producing content-hashed chunks (`dist/chunks/`), dead-code pruning of disabled features, minification, and production import map injection. Verified core footprint: 3.33 kB Brotli.

---

## 5. Verification Suite

* **Unit Tests:** 40+ tests across core modules and signal stores.
* **E2E Integration Tests:** 20+ tests verifying routing, API dispatching, feature flags, service worker caching, and headless compilation.
* **Pass Rate:** 61/61 tests passing (100%).
