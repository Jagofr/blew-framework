# Blew 🍃

<p align="left">
  <!-- Governance & License -->
  <a href="./LICENSE.md"><img src="https://img.shields.io/badge/License-ACPNCL--1.0-blue.svg?style=flat-square" alt="License: ACPNCL-1.0" /></a>
  <a href="https://github.com/Jagofr/acpncl/blob/main/license/ACPNCL-1.0.md"><img src="https://img.shields.io/badge/SPDX_Identifier-LicenseRef--ACPNCL--1.0-orange.svg?style=flat-square" alt="SPDX Identifier" /></a>
  <img src="https://img.shields.io/badge/Status-Active_Development-yellowgreen.svg?style=flat-square" alt="Status: Active Development" />
  <img src="https://img.shields.io/badge/Version-0.1.0--dev-lightgrey.svg?style=flat-square" alt="Version: 0.1.0-dev" />
  <a href="https://github.com/Jagofr/blew-framework/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>

  <!-- GitHub & Source -->
  <a href="https://github.com/Jagofr/blew-framework"><img src="https://img.shields.io/badge/GitHub-Jagofr%2Fblew--framework-181717?style=flat-square&logo=github" alt="GitHub Repository: Jagofr/blew-framework" /></a>
  <a href="https://github.com/Jagofr/blew-framework/stargazers"><img src="https://img.shields.io/github/stars/Jagofr/blew-framework?style=flat-square&color=gold" alt="GitHub Stars" /></a>
  <a href="https://github.com/Jagofr/blew-framework/issues"><img src="https://img.shields.io/github/issues/Jagofr/blew-framework?style=flat-square&color=blue" alt="GitHub Issues" /></a>

  <!-- Web & Hosting -->
  <a href="https://blew.jagofr.xyz"><img src="https://img.shields.io/badge/Website-blew.jagofr.xyz-0070f3.svg?style=flat-square" alt="Website" /></a>
  <a href="https://docs.blew.jagofr.xyz"><img src="https://img.shields.io/badge/Docs-docs.blew.jagofr.xyz-teal.svg?style=flat-square" alt="Docs Portal" /></a>

  <!-- Architectural Targets -->
  <img src="https://img.shields.io/badge/Dependencies-0_Zero-success.svg?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/Target_Size-%3C_5_kB_brotli-blueviolet.svg?style=flat-square" alt="Target Core Size < 5 kB" />
  <img src="https://img.shields.io/badge/Cold_Start-0ms_(Zero--Build)-gold.svg?style=flat-square" alt="0ms Cold Start" />
  <img src="https://img.shields.io/badge/Architecture-Vertical_Feature_Sliced-darkgreen.svg?style=flat-square" alt="Vertical Feature Sliced" />

  <!-- Standards & Platform Baseline -->
  <img src="https://img.shields.io/badge/Platform-Evergreen_Browsers-informational.svg?style=flat-square" alt="Platform: Modern Browsers" />
  <img src="https://img.shields.io/badge/Standard-Web_Components-ff69b4.svg?style=flat-square" alt="Web Components" />
  <img src="https://img.shields.io/badge/Routing-Navigation_API-9cf.svg?style=flat-square" alt="Navigation API" />
  <img src="https://img.shields.io/badge/Transitions-View_Transitions_API-purple.svg?style=flat-square" alt="View Transitions API" />
  <img src="https://img.shields.io/badge/PWA-Installable_%26_Offline-red.svg?style=flat-square" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/ECMAScript-Native_ES_Modules-yellowgreen.svg?style=flat-square" alt="Native ES Modules" />
</p>

> A breezy, standards-native, zero-build Progressive Web Application (PWA) framework engineered directly atop modern web platform primitives.  
> **Source Repository:** [github.com/Jagofr/blew-framework](https://github.com/Jagofr/blew-framework) &bull; **Official Hub:** [blew.jagofr.xyz](https://blew.jagofr.xyz) &bull; **Documentation:** [docs.blew.jagofr.xyz](https://docs.blew.jagofr.xyz) &bull; **Live Demos:** [demo.blew.jagofr.xyz](https://demo.blew.jagofr.xyz)

Blew eliminates mandatory compile steps, synthetic bundlers, and framework runtime bloat. By building directly upon standard browser features—HTML Import Maps, Web Components, Constructable Stylesheets, the Navigation API, `URLPattern`, and the View Transitions API—Blew provides a 0ms cold-start development environment alongside an optional headless compiler for production distribution.

---

## 🧭 Core Architectural Philosophy

1. **Standards Over Abstractions:** If an evergreen browser provides a native mechanism, Blew delegates to that primitive instead of inventing synthetic runtime layers or Virtual DOM abstractions.
2. **Zero-Build Development by Default:** Launch any static HTTP server (`npx serve`, Caddy, Python `http.server`, or Bun) and code directly with native ES modules. No file watchers, no compulsory transpilers, and no source maps to troubleshoot.
3. **Dual-Mode Production Parity:** Run pure, unbundled source files in development, or pass them through an optional headless compiler (`node build.js`) to generate content-hashed chunks, minified styles, and cache manifests with zero changes to source semantics.
4. **Vertical Slice Feature Architecture:** Each domain capability (UI custom element, scoped stylesheet, reactive state store, and data endpoint) resides within its own isolated folder under `src/features/`.
5. **Atomic Feature Flagging:** Enable, dark-launch, or dismantle an entire feature slice (both its client view and backend endpoint) via a single `disabled: boolean` flag in your manifest.

---

## 🏷️ Standard Naming & Namespace Conventions

Blew establishes standardized naming patterns across all framework surfaces to guarantee collision-free integration:

| Layer | Standard Pattern | Concrete Example | Specification Reference |
| :--- | :--- | :--- | :--- |
| **Custom Elements** | `b-<name>` | `<b-shell>`, `<b-notes-view>`, `<b-outlet>` | W3C Custom Elements v1 |
| **Module Specifiers** | `@blew/<package>` | `@blew/core`, `@blew/router`, `@blew/signals` | WHATWG Import Maps |
| **Feature Aliases** | `@features/<name>` | `@features/notes/endpoint.js` | WHATWG Import Maps |
| **Global Runtime API**| `Blew.<method>` | `Blew.navigate('/notes')`, `Blew.badge.set(3)` | Host Global Property |
| **Directives / Attributes**| `b-<directive>` | `<a href="/notes" b-link>` | HTML5 Custom Data Attributes |
| **Transition Keyframes**| `b-<animation>` | `::view-transition-old(root) { animation: b-slide-out; }` | W3C View Transitions API |
| **Repository & Issues** | `Jagofr/blew-framework` | `github.com/Jagofr/blew-framework/issues` | GitHub Standard |
| **Canonical Origin** | Domain Standard | `blew.jagofr.xyz` (`docs.blew.jagofr.xyz`) | IETF RFC 1034 / DNS |
| **License Header** | SPDX Standard | `SPDX-License-Identifier: LicenseRef-ACPNCL-1.0` | ACPNCL v1.0 Standard |

---

## 🌟 Key Technical Pillars

### 1. Dual-Mode Execution Model
* **Native Import Maps (`<script type="importmap">`):** Native bare-specifier resolution (`@blew/`, `@features/`, `@ui/`) directly in the browser without build-time alias plugins.
* **0ms Cold-Start Development:** Instant startup on any local or remote static file server.
* **Headless Production Compiler:** Standalone build script (`node build.js` powered by esbuild or Rolldown) producing:
  * ESM code-split chunks (`chunks/[name].[hash].js`)
  * Tree-shaking and dead-code elimination for disabled features
  * JavaScript and CSS minification
  * Injected production import maps with immutable caching hashes
* **Environment Bridge:** Uniform runtime detection via `window.__APP_ENV__` and `process.env.NODE_ENV` (`ENV.isProd()`, `ENV.isDev()`).

### 2. Vertical Feature Slicing & Wildcard Endpoints
* **Self-Contained Domains:** UI view, local scoped styles, reactive store, and data endpoints reside together inside `src/features/[feature-name]/`.
* **Atomic Route Manifest (`src/routes.js`):** Unified pairing of UI views and backend routes under a single feature block with a single kill-switch flag (`disabled: true`).
* **Wildcard Endpoint Standard (`/api/:feature/:action*`):** A single wildcard route per feature slice resolves both REST verbs (`GET`, `POST`, `PATCH`, `DELETE`) and named RPC action exports (`archive`, `exportMarkdown`).
* **Universal Request/Response Handling:** Built on the WinterCG fetch standard (`Request` $\rightarrow$ `Response`), allowing endpoints to execute identically in local Service Workers (offline mode) and server/edge runtimes (online mode).

### 3. Native Routing & Direction-Aware Transitions
* **Navigation API Integration:** Interception of user interactions, mobile gestures, and history traversal via `window.navigation` without monkey-patching `history.pushState`.
* **Declarative Route Matching:** Standardized tokenized path resolution and parameter parsing via `URLPattern`.
* **Direction-Aware View Transitions:** Automated `document.startViewTransition()` coordination that dynamically assigns transition vectors (`.b-nav-forward`, `.b-nav-backward`).
* **Native State Preservation:** History entries, scroll restoration, and transient state backed directly by `navigation.currentEntry.getState()`.

### 4. Lightweight Component Engine & Scoped Styles
* **`BlewElement` Base Class:** Ultra-lean ($< 1.5\text{ kB}$) subclass of `HTMLElement` providing Shadow DOM encapsulation, template cloning (`cloneNode`), and automatic signal unsubscription.
* **Constructable Stylesheets:** Shared application theme and component styles compiled once and cached across instances via `adoptedStyleSheets`, keeping memory overhead minimal ($< 1\text{ MB}$ per 1,000 components).
* **Native CSS `@scope`:** True style boundaries without BEM prefixes or class-hash mangling, including donut scoping to protect projected `<slot>` content.
* **Top-Layer Integration:** Overlay, toast, and modal primitives built natively upon `<dialog>` and the `popover` API with light-dismissal and focus management.

---

## 📁 Repository Structure Blueprint

```text
blew-framework/
├── index.html                  # Dev entry point with native import map
├── package.json                # Dev scripts and minimal build tooling
├── build.js                    # Optional headless production bundler
├── sw.js                       # ESM Service Worker (offline cache & local endpoints)
├── LICENSE.md                  # ACPNCL v1.0 standard license
├── CONTRIBUTION.md             # Contribution guidelines & upstream rights grant
├── README.md                   # Project overview and reference
├── docs/                       # Specifications, Scrum plan, and reference manuals
│   ├── API.md                  # Complete API reference (@blew/*)
│   ├── QUICK-START.md          # 5-minute setup and feature walkthrough
│   ├── ROADMAP.md              # Long-term platform phases and goals
│   ├── SCRUM-PLAN.md           # Solo developer sprint operating model
│   └── man/                    # Architectural manuals
│       ├── home.md             # Architecture overview and design axioms
│       ├── contents.md         # Topic index and navigation graph
│       ├── features.md         # Feature slices and wildcard API engine
│       └── styling.md          # Constructable sheets, tokens, and @scope
└── src/
    ├── app.js                  # Application bootstrap and router setup
    ├── routes.js               # Unified Feature Manifest (Views + APIs + Flags)
    ├── core/                   # Sub-5KB Blew core runtime
    │   ├── element.js          # BlewElement base component class
    │   ├── signals.js          # Fine-grained reactive state primitives
    │   ├── router.js           # Navigation API & View Transitions engine
    │   ├── api-router.js       # Wildcard URLPattern Request/Response dispatcher
    │   ├── router-utils.js     # Route extraction and feature-flag filter
    │   ├── theme.css           # Global tokens, reset, and base cascade layers
    │   └── env.js              # Development/production environment detector
    ├── components/             # Reusable shell & layout custom elements
    │   ├── b-shell.js          # App header, drawer, and responsive wrapper
    │   └── b-dialog.js         # Top-layer native dialog helper
    └── features/               # Domain-driven vertical feature slices
        ├── home/
        │   └── home-view.js    # Default landing screen view
        └── notes/              # Example feature slice
            ├── notes-view.js   # UI Custom Element: <b-notes-view>
            ├── notes.css       # Scoped stylesheet
            ├── store.js        # Reactive TC39 signal store
            └── endpoint.js     # Multi-method / RPC action data endpoint
```

---

## ⚡ Quick Architecture Overview

### 1. The Development Shell (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Blew Application</title>
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
    <h1>Blew App</h1>
  </header>

  <!-- Router outlet where views are mounted -->
  <main id="b-outlet"></main>
</body>
</html>
```

### 2. Feature-Flagged Manifest (`src/routes.js`)

Pair UI screens and API endpoints under a single domain declaration:

```javascript
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
    name: 'notes',
    disabled: false, // 👈 Single flag disables UI & API across client, SW, and server
    view: {
      pattern: '/notes/:subview*',
      tag: 'b-notes-view',
      load: () => import('@features/notes/notes-view.js')
    },
    api: {
      pattern: '/api/notes/:action*',
      load: () => import('@features/notes/endpoint.js')
    }
  }
];
```

### 3. Multi-Method & RPC Endpoint (`src/features/notes/endpoint.js`)

Adheres strictly to the WinterCG fetch specification (`Request` $\rightarrow$ `Response`):

```javascript
// REST Verb Handlers
export async function GET(request, { params }) {
  const noteId = params?.action;
  return Response.json(noteId ? { id: noteId, title: `Note ${noteId}` } : [{ id: '1', title: 'First Note' }]);
}

export async function POST(request) {
  const data = await request.json();
  return Response.json({ id: crypto.randomUUID(), ...data }, { status: 201 });
}

// Named RPC Action: POST /api/notes/archive
export async function archive(request) {
  const { id } = await request.json();
  return Response.json({ success: true, archived: id });
}
```

---

## 🌐 Web Standards Reference

| Feature Area | Native Standard | Baseline Compatibility |
| :--- | :--- | :--- |
| **Module Specifiers** | [WHATWG Import Maps](https://html.spec.whatwg.org/multipage/webappapis.html#import-maps) | Chromium 89+, Safari 16.4+, Firefox 108+ |
| **Client Routing** | [W3C Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API) | Chromium 102+ (Polyfill fallback for WebKit/Gecko) |
| **Route Patterns** | [WHATWG URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern_API) | Chromium 95+ (Standard polyfill fallback) |
| **Screen Transitions**| [W3C View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) | Chromium 111+, Safari 18+ |
| **Component Model** | [W3C Custom Elements v1 & Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) | All Evergreen Browsers |
| **Component Styling** | [Constructable Stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) & [CSS `@scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope) | Chromium 118+, Safari 17.4+, Firefox 128+ |
| **Overlays & Dialogs**| [HTML `<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) & [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) | Chromium 114+, Safari 17+, Firefox 125+ |
| **Data Protocol** | [WinterCG Fetch Spec](https://fetch.spec.whatwg.org/) (`Request` / `Response`) | Universal Standard |

---

## ⚖️ License & Intellectual Property

Blew is licensed under the **Asymmetric Copyleft to Permanent Non-Commercial License (ACPNCL) Version 1.0**.

* **SPDX Identifier:** `LicenseRef-ACPNCL-1.0`
* **Canonical Specification:** [Jagofr/acpncl](https://github.com/Jagofr/acpncl/blob/main/license/ACPNCL-1.0.md)
* **GitHub Repository:** [github.com/Jagofr/blew-framework](https://github.com/Jagofr/blew-framework)
* **Author & Stewardship Portal:** [blew.jagofr.xyz](https://blew.jagofr.xyz)
* **Local Terms & Rights:** See [`LICENSE.md`](./LICENSE.md)

### Key Licensing Summary

* **Non-Commercial Freedom:** Non-commercial educational, academic, hobbyist, and personal use is fully permitted without charge.
* **Commercial Restriction:** Any commercial use, hosting as a paid commercial service, or direct integration into revenue-generating platforms requires a commercial license from the author(s).
* **Asymmetric Copyleft:** Downstream contributions and pull requests grant upstream non-exclusive commercial licensing rights to the original author, ensuring sustainable stewardship while keeping community editions permanently free and open for non-commercial exploration.

Copyright (c) 2026 Blew Framework Authors &bull; [github.com/Jagofr/blew-framework](https://github.com/Jagofr/blew-framework) &bull; [blew.jagofr.xyz](https://blew.jagofr.xyz)