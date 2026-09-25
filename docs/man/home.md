# Blew Manual: System Overview & Architecture 🍃

```
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

Welcome to the canonical reference manual for **Blew**—a lightweight, standards-native, zero-dependency Progressive Web Application (PWA) framework engineered directly atop modern web platform primitives.

## 1. Executive Summary

Blew eliminates the compulsory build step from modern frontend web development. By leveraging native browser capabilities—such as HTML Import Maps, Web Components, Constructable Stylesheets, the Navigation API, `URLPattern`, and the View Transitions API—Blew allows developers to write pure, uncompiled ECMAScript and run it instantly on any static file server with a $0\text{ ms}$ **cold start**.

When preparing for production deployment, Blew provides an optional, headless compiler (`build.js`) that produces minified, content-hashed, and tree-shaken assets without altering source code semantics.

### Primary Architectural Axioms

1. **Zero External Runtime Dependencies:** The entire `@blew/*` core operates with zero third-party npm packages.
2. **Platform Delegation:** If an evergreen browser provides a native mechanism, Blew delegates to that primitive instead of maintaining an abstract runtime layer.
3. **Vertical Slice Organization:** Application features are grouped by domain capabilities (`src/features/[name]/`) rather than technical tiers.
4. **Universal Request/Response Handling:** Backend endpoints follow the WinterCG standard (`Request` $\rightarrow$ `Response`), allowing identical execution on edge runtimes, Node.js, Bun, or offline inside an ESM Service Worker.

---

## 2. Framework Conventions & Standards Reference

Blew establishes standardized naming conventions across all framework layers to prevent namespace collisions and maintain uniform ergonomics:

| Domain | Syntax / Rule | Example | Specification Reference |
| :--- | :--- | :--- | :--- |
| **Custom Elements** | `b-<name>` | `<b-shell>`, `<b-outlet>` | W3C Custom Elements v1 |
| **Import Map Specifiers** | `@blew/<module>` | `@blew/core`, `@blew/router` | WHATWG Import Maps |
| **Feature Aliases** | `@features/<name>` | `@features/notes/store.js` | WHATWG Import Maps |
| **UI Component Aliases** | `@ui/<component>` | `@ui/modal.js` | WHATWG Import Maps |
| **Runtime API** | `Blew.<method>` | `Blew.navigate('/home')` | Host Global Property |
| **Template Directives** | `b-<action>` | `<a href="/" b-link>` | HTML5 Custom Data Attributes |
| **View Transition CSS** | `b-<animation>` | `animation: b-slide-left;` | W3C View Transitions API |
| **SPDX License Header** | `LicenseRef-ACPNCL-1.0` | In-source header block | ACPNCL v1.0 Standard |

---

## 3. High-Level System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Native Browser Host                             │
├────────────────────────────────────────────────────────────────────────┤
│  HTML Import Map Resolution (<script type="importmap">)                │
│  ├─ @blew/core          ──► src/core/element.js                        │
│  ├─ @blew/signals       ──► src/core/signals.js                        │
│  ├─ @blew/router        ──► src/core/router.js                         │
│  ├─ @blew/api           ──► src/core/api-router.js                     │
│  └─ @blew/router-utils  ──► src/core/router-utils.js                  │
├────────────────────────────────────────────────────────────────────────┤
│                        Blew Application Shell                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Navigation API Router (window.navigation.addEventListener)       │  │
│  │  └─► URLPattern Resolution                                       │  │
│  │  └─► View Transitions Orchestrator (startViewTransition)         │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │ mounts dynamic views              │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ <main id="b-outlet">                                             │  │
│  │   └─► <b-feature-view> (extends BlewElement)                     │  │
│  │         ├─ Constructable Styles (adoptedStyleSheets)             │  │
│  │         ├─ TC39 Signals Subscription Store                       │  │
│  │         └─ Shadow DOM Encapsulation                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│                       Offline & Data Subsystem                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ESM Service Worker (sw.js)                                       │  │
│  │  ├─ Wildcard API Router (/api/:feature/:action*)                 │  │
│  │  ├─ Local endpoint.js execution (WinterCG Request -> Response)   │  │
│  │  └─ Multi-Tier Cache (Hashed Chunks, Dynamic Modules, SWR)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Dual-Mode Operation Matrix

Blew is constructed to behave identically across two execution topologies:

### Development Mode (Unbundled)

* **Serving:** Run any static HTTP server (`npx serve`, `bunx serve`, or Python's `http.server`).
* **Resolution:** The browser parses `index.html`'s `<script type="importmap">` directly.
* **Imports:** Bare imports resolve straight to source files on disk.
* **Compilation:** None. Code updates reflect on browser reload without watching or intermediate build states.

### Production Mode (Optimized Distribution)

* **Compiler:** Standalone Node.js script (`node build.js`) powered by `esbuild` or `Rolldown`.
* **Output:** Bundled and minified ES modules with content-hashed file names (`dist/chunks/[name].[hash].js`).
* **Import Map:** Inlined directly into `dist/index.html`, mapping bare specifiers to the hashed production outputs.
* **Tree Shaking:** Features flagged with `disabled: true` in `src/routes.js` are eliminated from final payloads.

---

## 5. Navigating the Documentation

The Blew reference documentation is divided into specialized manuals:

* [**Table of Contents & Index**](contents.md): Comprehensive index of guides, modules, and platform integration chapters.
* [**Feature Slices & Wildcard API**](features.md): Deep dive into building modular domain packages, signal stores, and dual-mode endpoints.
* [**Styling Architecture, Constructable Sheets & Scoping**](styling.md): Guide to inherited theme tokens, constructable stylesheet deduplication, and native CSS `@scope`.
* [**Canonical API Reference**](../API.md): Parameter listings and return types across `@blew/*` modules.
* [**Quick Start Guide**](../QUICKSTART.md): Walkthrough from an empty directory to a working PWA.
* [**Development Roadmap**](../ROADMAP.md): Evolutionary milestones and release schedules.
* [**Solo Developer Scrum Plan**](../SCRUM-PLAN.md): Cadence guidelines, story point estimates, and sprint backlogs.