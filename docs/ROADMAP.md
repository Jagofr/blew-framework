# Blew Framework Development Roadmap 🍃

```
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

This roadmap outlines the strategic phases, architectural milestones, and platform deliverables for the Blew framework. Blew is engineered to deliver a 0ms cold-start, standards-native progressive web app framework with zero compulsory build tooling.

---

## 🎯 Strategic Targets & Constraints

* **Core Runtime Footprint:** Sub-$5\text{ kB}$ minified + brotli across the core engine (`@blew/core`, `@blew/signals`, `@blew/router`, `@blew/api`).
* **Zero Runtime Dependencies:** $0$ third-party npm packages required in development or production runtimes.
* **Browser Baseline:** Modern evergreen browsers—Chromium 115+, Safari 17.4+, and Firefox 128+—with standardized progressive fallbacks.
* **Standards Alignment:** Strict adherence to WHATWG (Import Maps, Streams, DOM), W3C (Web Components, Navigation API, View Transitions API), WinterCG (Fetch `Request`/`Response`), and TC39 (Signals Proposal).

---

## 🧭 Phased Execution Overview

```text
Phase 0: Technical Spike & Workspace Setup (Weeks 1–2) [PLANNED / KICKOFF]
   │
Phase 1: Component Core & Micro-Signals (Weeks 3–4)
   │
Phase 2: Navigation API & View Transitions (Weeks 5–6)
   │
Phase 3: Dual-Mode Runtime & Headless Compiler (Weeks 7–8)
   │
Phase 4: Progressive Web App Engine & Wildcard API (Weeks 9–10)
   │
Phase 5: Scaffolding CLI, Docs & 1.0 Tag (Weeks 11–12)
   │
Phase 6: Post-1.0 Evolution (SSR, Storage Engines, Edge Adapters)
```

---

## Phase 0: Technical Spike & Workspace Setup (Weeks 1–2)

**Goal:** Establish technical feasibility, directory layout, import map specifications, and repository standards baseline.

* [ ] **Standards Baseline Verification:**
  * Validate native `<script type="importmap">` bare specifier resolution across unbundled browser runtimes.
  * Verify `URLPattern` matching and polyfill detection strategies.
  * Test Constructable Stylesheet ingestion (`adoptedStyleSheets`) inside Shadow DOM roots.
* [ ] **Repository Governance & Foundation:**
  * Enforce ACPNCL v1.0 standard licensing and SPDX header verification.
  * Establish clean repository structure with strict separation of `src/core/` and `src/features/`.
  * Set up static local development server test harness.
* [ ] **Milestone Deliverable:** Minimal zero-build proof-of-concept proving unbundled ESM loading with a 0ms cold start over local HTTP servers.

---

## Phase 1: Component Core & Micro-Signals (Weeks 3–4)

**Goal:** Deliver the sub-$1.5\text{ kB}$ custom element base class (`@blew/core`) and the zero-VDOM reactivity engine (`@blew/signals`).

* [ ] **`BlewElement` Base Class (`src/core/element.js`):**
  * Extend native `HTMLElement` with automated open Shadow DOM encapsulation.
  * In-memory Constructable Stylesheet cache (`this.adoptStyles()`) with global theme auto-adoption at index $0$.
  * Tagged template literal helper (`this.html`) using cached `<template>` cloning.
  * Automatic lifecycle cleanup registry (`this.subscribe()`) linked to `disconnectedCallback()`.
* [ ] **Reactivity Store (`src/core/signals.js`):**
  * Implement fine-grained signal primitives: `signal()`, `computed()`, `effect()`, and `batch()`.
  * Microtask queuing (`queueMicrotask`) for batched DOM scheduling without Virtual DOM overhead.
  * TC39 Signals proposal semantic alignment.
* [ ] **Global Cascade & Theme Tokens (`src/core/theme.css`):**
  * CSS `@layer` structure (`b-reset`, `b-tokens`, `b-base`, `b-layout`).
  * Adaptive design tokens using native `light-dark()` color notation.
* [ ] **Milestone Deliverable:** Fully functional standalone component testbed demonstrating micro-signal reactivity with zero DOM diffing.

---

## Phase 2: Navigation API & View Transitions (Weeks 5–6)

**Goal:** Deliver modern client-side navigation and direction-aware View Transitions.

* [ ] **`BlewRouter` Core (`src/core/router.js`):**
  * Intercept native `window.navigation.addEventListener('navigate')` events without history monkey-patching.
  * Declarative route matching via WHATWG `URLPattern`.
  * Safari and Firefox fallback via click interception and History API emulation.
* [ ] **View Transitions Orchestrator:**
  * Automated coordination with `document.startViewTransition()`.
  * Dynamic navigation vector detection: assign `.b-nav-forward`, `.b-nav-backward`, or `.b-nav-replace`.
  * Transition utility keyframes (`b-slide-out`, `b-slide-in`, `b-crossfade`).
* [ ] **State & History Restoration:**
  * Scroll position and ephemeral view state persisted through `navigation.currentEntry.getState()`.
* [ ] **Milestone Deliverable:** Multi-page routing shell with animated page transitions and dynamic chunk loading.

---

## Phase 3: Dual-Mode Runtime & Headless Compiler (Weeks 7–8)

**Goal:** Enable switching between zero-build unbundled development and a high-performance production distribution.

* [ ] **Environment Bridge (`src/core/env.js`):**
  * Unified runtime detector bridging browser `window.__APP_ENV__` and Node/Bun `process.env.NODE_ENV`.
* [ ] **Headless Production Compiler (`build.js`):**
  * Standalone compiler script using esbuild or Rolldown.
  * Prune disabled features (`disabled: true`) from the production dependency graph.
  * ESM code-split chunk generation (`dist/chunks/[name].[hash].js`).
  * CSS and JS minification with production import map generation in `dist/index.html`.
* [ ] **Milestone Deliverable:** Single-command production build (`node build.js`) producing an immutable, CDN-ready static distribution.

---

## Phase 4: Progressive Web App Engine & Wildcard API (Weeks 9–10)

**Goal:** Equip Blew with offline-first capabilities, universal API dispatching, and hardware integration.

* [ ] **Wildcard API Router (`src/core/api-router.js`):**
  * Universal WinterCG dispatcher handling `Request` $\rightarrow$ `Response`.
  * Dispatch resolution order: Named Action export $\rightarrow$ HTTP verb export $\rightarrow$ 405 Method Not Allowed.
* [ ] **ESM Service Worker Architecture (`sw.js`):**
  * Multi-tier caching: Precache core, Cache-First for content-hashed chunks, Stale-While-Revalidate for views.
  * Offline endpoint execution: execute `src/features/*/endpoint.js` directly within the Service Worker when offline.
* [ ] **Platform & Hardware Helpers (`Blew.*` Global API):**
  * Web Badging API (`Blew.badge.set()`, `Blew.badge.clear()`).
  * Web Share API (`Blew.share()`).
  * Native top-layer modal management (`Blew.dialog.showModal()` using `<dialog>` and `popover`).
* [ ] **Milestone Deliverable:** 100/100 Lighthouse PWA score with offline-capable feature slices.

---

## Phase 5: Scaffolding CLI, Docs & 1.0 Release (Weeks 11–12)

**Goal:** Streamline developer onboarding, complete interactive documentation, and tag version 1.0.0.

* [ ] **Scaffolding Tooling (`create-blew`):**
  * Interactive starter template generator (`npm create blew@latest`).
  * Feature generator CLI (`blew new feature <name>`).
* [ ] **Documentation Portal:**
  * Official documentation website built and deployed using Blew itself.
  * Interactive live playground demonstrating micro-signals and View Transitions.
* [ ] **Release Verification:**
  * Audit size budgets ($< 5\text{ kB}$ Brotli core).
  * Tag `v1.0.0` on GitHub.

---

## Phase 6: Post-1.0 Evolutions

* **Declarative Shadow DOM SSR / SSG:** Static HTML prerendering using native `<template shadowrootmode="open">` for instantaneous FCP.
* **Storage Abstraction Engine:** Built-in IndexedDB / OPFS (Origin Private File System) sync abstractions.
* **WinterCG Edge Adapters:** Deployment adapters for Cloudflare Workers, Fastly Compute, Bun, and Node.js.