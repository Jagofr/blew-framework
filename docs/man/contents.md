# Blew Manual: Table of Contents & Topic Index 🍃

```
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

Welcome to the central master index of the Blew documentation system. This document indexes all chapters, technical specifications, and API guides included with the framework.

---

## 1. Quick Navigation & Foundations

* [**Manual Home & Architecture Overview**](home.md)
  * Executive Summary & $0\text{ ms}$ Cold-Start Guarantee
  * Primary Architectural Axioms
  * Framework Conventions & Naming Rules
  * Dual-Mode Runtime Execution Matrix
* [**Quick Start Guide**](../QUICKSTART.md)
  * Prerequisites & Browser Support Matrix
  * Zero-Build Project Initialization
  * Setting Up the Native Import Map (`index.html`)
  * Creating Your First Feature Slice (View + Store + Endpoint)
  * Manifest Declaration (`src/routes.js`)
  * Bootstrapping & Local Static Server Execution
* [**Canonical API Reference**](../API.md)
  * `@blew/core` (`BlewElement` Base Class)
  * `@blew/signals` (Reactivity Engine)
  * `@blew/router` (Navigation API & View Transitions)
  * `@blew/api` (Wildcard Request/Response Dispatcher)
  * `@blew/router-utils` (Route Ingestion & Filtering)
  * `@blew/env` (Environment Bridge)
  * `Blew.*` (Global Runtime Helpers)

---

## 2. Architecture & Design Patterns

* [**Feature Slices & Wildcard API Engine**](features.md)
  * Anatomy of a Vertical Feature Slice
  * UI Screen Design with Custom Elements & Shadow DOM
  * Multi-Method Endpoints & WinterCG Compliance
  * Named Action Dispatching (RPC-Style Exports)
  * Atomic Feature Flags & Dynamic Route Pruning
* [**Styling Architecture, Constructable Sheets & Scoping**](styling.md)
  * The Shadow DOM Styling Boundary & Two-Tier Pipeline
  * Base Theme Ingestion & Auto-Adoption Order
  * Piercing the Boundary with Inherited CSS Custom Properties
  * Constructable Stylesheets (`adoptedStyleSheets`) & Memory Deduping ($< 1\text{ MB}$)
  * Native CSS `@scope` & Donut Scoping Boundaries
  * Practical Feature Styling & Localized Theme Reskinning
* **Core Primitives & Reactivity**
  * Sub-$1.5\text{ kB}$ Custom Element Lifecycle
  * TC39 Signals Alignment & Microtask Batching
  * Subscription Management & Leak Prevention
  * Memory Footprint Benchmarking ($< 1\text{ MB}$ per $1,000$ Nodes)
* **Client-Side Navigation & Motion**
  * Modern `window.navigation` vs. Legacy History API
  * Declarative Routing with `URLPattern`
  * Direction-Aware Vector Transitions (`b-nav-forward`, `b-nav-backward`)
  * Scroll & State Restoration via `NavigationHistoryEntry`
  * Firefox and Safari Compatibility Fallbacks

---

## 3. PWA, Offline & Backend Runtime

* **Dual-Mode Execution Model**
  * Unbundled Development Mode ($0\text{ ms}$ Startup)
  * Headless Production Compiler (`build.js`)
  * ESM Chunking, Minification & Content Hashing
  * Dead-Code Stripping for Disabled Features
* **Progressive Web App Engine**
  * ESM Service Worker (`sw.js`)
  * Multi-Tier Caching Architecture (Precache, Cache-First, SWR)
  * Offline Local Feature Endpoint Execution
  * App Installation Lifecycle & Custom Prompts
* **Hardware & OS Integration**
  * Web Badging API (`Blew.badge`)
  * Native Web Share Sheets (`Blew.share`)
  * Top-Layer Modals & Sheets (`<dialog>` and `popover`)

---

## 4. Project Governance, Planning & Standards

* [**Contributing Guidelines**](../CONTRIBUTION.md)
  * Contributor License Agreement (CLA) & Upstream Rights Grant
  * Architectural Invariants (Zero Core Dependencies)
  * Code Style, Prefixes & Conventions
  * Pull Request & Conventional Commit Standards
* [**Solo Developer Scrum & Milestones**](../SCRUM-PLAN.md)
  * Solo Agile Operating Model ($9\text{--}15\text{ hrs/week}$, $18\text{--}22\text{ SP}$)
  * Definition of Done (DoD) & Budget Checks ($< 5\text{ kB}$)
  * Sprint Cycle Backlogs (Cycles 1 through 7)
  * Flow Protection & Anti-Burnout Guidelines
* [**Long-Term Roadmap**](../ROADMAP.md)
  * Target Browser Matrix (Chromium 115+, Safari 17.4+, Firefox 128+)
  * Phases 0 through 6 Overview
  * Declarative Shadow DOM SSR / SSG (Post-1.0)
  * OPFS & WinterCG Edge Runtime Adapters
* [**ACPNCL v1.0 License**](../LICENSE.md)
  * Asymmetric Copyleft to Permanent Non-Commercial License Terms
  * Commercial Use Restrictions & Exemptions
  * Downstream Reciprocity & Upstream Rights Assignment

---

## 5. Master Symbol & Specifier Index

### Module Specifiers (`@blew/*`)

| Specifier | Source File | Description |
| :--- | :--- | :--- |
| `@blew/core` | `src/core/element.js` | `BlewElement` base Web Component class. |
| `@blew/signals` | `src/core/signals.js` | TC39-aligned signal primitives (`signal`, `computed`, `effect`, `batch`). |
| `@blew/router` | `src/core/router.js` | Navigation API and View Transitions orchestrator. |
| `@blew/api` | `src/core/api-router.js` | Universal WinterCG `Request` $\rightarrow$ `Response` wildcard dispatcher. |
| `@blew/router-utils` | `src/core/router-utils.js` | Manifest parser and disabled feature filter (`extractActiveRoutes`). |
| `@blew/env` | `src/core/env.js` | Cross-environment runtime detector (`ENV.isDev()`, `ENV.isProd()`). |

### Global Runtime Shortcuts (`Blew.*`)

| Method / Namespace | Reference | Summary |
| :--- | :--- | :--- |
| `Blew.navigate(url, options)` | [`docs/API.md`](../API.md#7-global-runtime-helpers-blew) | Programmatic client-side navigation. |
| `Blew.back()` / `Blew.forward()` | [`docs/API.md`](../API.md#7-global-runtime-helpers-blew) | Traverses browser navigation history entries. |
| `Blew.badge.set(count)` | [`docs/API.md`](../API.md#7-global-runtime-helpers-blew) | Updates device home screen badge icon count. |
| `Blew.badge.clear()` | [`docs/API.md`](../API.md#7-global-runtime-helpers-blew) | Clears device home screen badge. |
| `Blew.share(data)` | [`docs/API.md`](../API.md#7-global-runtime-helpers-blew) | Invokes native operating system share sheet. |
| `Blew.dialog.showModal(selector)` | [`docs/API.md`](../API.md#7-global-runtime-helpers-blew) | Promotes target `<dialog>` to the native top layer. |
| `Blew.dialog.close(selector)` | [`docs/API.md`](../API.md#7-global-runtime-helpers-blew) | Closes and light-dismisses active top-layer modal. |

---

## 6. Document Cross-Reference Map

```text
                     ┌──────────────────────┐
                     │     README.md        │
                     └──────────┬───────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ docs/QUICKSTART  │  │   docs/API.md    │  │ docs/SCRUM-PLAN  │
└─────────┬────────┘  └─────────┬────────┘  └─────────┬────────┘
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                ▼
                     ┌──────────────────────┐
                     │ docs/man/contents.md │ (You are here)
                     └──────────┬───────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ docs/man/home.md │  │docs/man/features │  │docs/man/styling  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```