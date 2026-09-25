# Blew Framework Solo Developer Scrum & Milestone Plan 🍃

```
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

This operating plan adapts agile principles for a single maintainer working on a flexible, time-boxed cadence. The structure prioritizes flow, manageable scope, and verified increments over rigid team ceremonies.

---

## 1. Operating Model & Capacity Baseline

* **Developer Allocation:** 1 Solo Maintainer
* **Commitment Target:** 3 hours/day, 3–5 variable days/week
* **Weekly Capacity:** $\sim 9\text{ to }15\text{ focused hours}$ (average $\sim 12\text{ hours/week}$)
* **Milestone Cycle (Sprint Equivalent):** 2 Weeks ($\sim 20\text{ to }25\text{ total engineering hours}$)
* **Target Velocity:** $\sim 18\text{--}22\text{ story points (SP)}$ per 2-week cycle ($1\text{ SP} \approx 1\text{ hour of focused deep work}$)

### Solo Agile Cadence

* **Cycle Kickoff (Alternate Mondays / Day 1):** 30-minute personal backlog review. Select target issues for the upcoming 2-week block.
* **Session Log (Async Daily):** Quick 2-line commit summary or dev notebook entry at the start and close of each 3-hour work block.
* **Mid-Cycle Check (Day 5 or 6):** Quick scope check. If life or schedule disruptions reduce hours, drop lower-priority tasks rather than extending timelines.
* **Cycle Wrap & Verification (Day 10):** Run automated browser tests, verify bundle size budgets, and tag milestone progress.

### Definition of Done (DoD)

1. Zero external runtime dependencies added to `@blew/*`.
2. Passes test harness across Chromium, WebKit (Safari), and Gecko (Firefox).
3. Payload budget verified under $< 5\text{ kB}$ (brotli).
4. ACPNCL v1.0 SPDX header present on all new source files.
5. Code committed cleanly with Conventional Commit messages.

---

## 2. Milestone Horizon & Cycle Mapping

| Cycle | Timeline | Core Focus | Target Work | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Cycle 1** | Weeks 1–2 | Phase 0: Baseline Spike & Proof-of-Concept | 20 SP | Ready / Kickoff |
| **Cycle 2** | Weeks 3–4 | Phase 1A: `BlewElement` & Constructable CSS | 22 SP | Planned |
| **Cycle 3** | Weeks 5–6 | Phase 1B: TC39 Signals Reactivity Engine | 20 SP | Planned |
| **Cycle 4** | Weeks 7–8 | Phase 2: Navigation API & View Transitions | 22 SP | Planned |
| **Cycle 5** | Weeks 9–10 | Phase 3: Dual-Mode Runtime & Headless Compiler | 20 SP | Planned |
| **Cycle 6** | Weeks 11–12 | Phase 4: Service Worker & Wildcard API Engine | 20 SP | Planned |
| **Cycle 7** | Weeks 13–14 | Phase 5: Developer CLI, Docs & 1.0 Tag | 18 SP | Planned |

---

## 3. Detailed Milestone Backlog

### Cycle 1: Baseline Spike & Proof-of-Concept (Kickoff)

* **Goal:** Verify that zero-build browser standards behave consistently without toolchains.

| Issue ID | Type | Task / Story | Est. | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BLW-101` | Spike | Test native `<script type="importmap">` across evergreen browsers. | 3 SP | High | To Do |
| `BLW-102` | Spike | Validate `URLPattern` matching and polyfill detection. | 3 SP | High | To Do |
| `BLW-103` | Task | Establish repository governance, ACPNCL headers, and git config. | 2 SP | High | To Do |
| `BLW-104` | Task | Configure simple zero-build test server harness. | 4 SP | High | To Do |
| `BLW-105` | Task | Establish folder conventions and bare specifier structure. | 3 SP | Medium | To Do |
| `BLW-106` | Spike | Benchmark `adoptedStyleSheets` memory footprint across 1,000 nodes. | 5 SP | High | To Do |

---

### Cycle 2: `BlewElement` & Constructable Styling Engine

* **Goal:** Build the sub-$1.5\text{ kB}$ base Custom Element class.

| Issue ID | Type | Task / Story | Est. | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BLW-201` | Feature | Implement `BlewElement` base class extending `HTMLElement`. | 5 SP | Critical | Planned |
| `BLW-202` | Feature | Implement constructable stylesheet caching via `adoptStyles()`. | 3 SP | High | Planned |
| `BLW-203` | Feature | Implement tagged literal `<template>` parser (`this.html`). | 4 SP | High | Planned |
| `BLW-204` | Feature | Add automatic lifecycle disposal manager (`this.subscribe()`). | 3 SP | High | Planned |
| `BLW-205` | Feature | Add `this.dispatch()` helper with composed event bubbling. | 2 SP | Medium | Planned |
| `BLW-206` | Test | Write component lifecycle test suite using Web Test Runner. | 4 SP | High | Planned |

**Acceptance Criteria for `BLW-201`:**
* Subclasses automatically attach an open Shadow DOM root.
* `adoptStyles()` parses once and shares the cached `CSSStyleSheet` across instances.
* Disposers registered during connection fire cleanly on `disconnectedCallback()`.

---

### Cycle 3: TC39 Signals Reactivity Engine

* **Goal:** Deliver fine-grained, zero-VDOM reactivity in `@blew/signals`.

| Issue ID | Type | Task / Story | Est. | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BLW-301` | Feature | Build `signal<T>()` primitive with `.value` and `.update()`. | 4 SP | Critical | Planned |
| `BLW-302` | Feature | Implement memoized `computed<T>()` dependency tracking. | 4 SP | Critical | Planned |
| `BLW-303` | Feature | Implement `effect()` with cleanup returns. | 4 SP | High | Planned |
| `BLW-304` | Feature | Implement `batch()` with microtask scheduler (`queueMicrotask`). | 3 SP | High | Planned |
| `BLW-305` | Test | Stress-test dependency graph under rapid sequential writes. | 2 SP | Medium | Planned |
| `BLW-306` | Feature | Wire auto-subscription signal helpers into `BlewElement`. | 3 SP | High | Planned |

---

### Cycle 4: Navigation API, Routing & View Transitions

* **Goal:** Build client-side routing and smooth, direction-aware page transitions.

| Issue ID | Type | Task / Story | Est. | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BLW-401` | Feature | Build `BlewRouter` core listening to `window.navigation`. | 5 SP | Critical | Planned |
| `BLW-402` | Feature | Implement declarative route resolution via `URLPattern`. | 3 SP | High | Planned |
| `BLW-403` | Feature | Integrate `document.startViewTransition()` wrapper. | 4 SP | High | Planned |
| `BLW-404` | Feature | Build navigation direction classifier (`.b-nav-forward`, `.b-nav-backward`). | 3 SP | High | Planned |
| `BLW-405` | Feature | Build `extractActiveRoutes()` with `disabled: boolean` flag support. | 3 SP | Medium | Planned |
| `BLW-406` | Feature | Add fallback click interception for non-supporting browsers. | 4 SP | High | Planned |

---

### Cycle 5: Dual-Mode Runtime & Headless Compiler

* **Goal:** Enable single-command compilation for production while preserving zero-build dev.

| Issue ID | Type | Task / Story | Est. | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BLW-501` | Feature | Implement environment detector bridge (`@blew/env`). | 2 SP | Medium | Planned |
| `BLW-502` | Tooling | Write standalone production build runner (`build.js` via esbuild). | 5 SP | Critical | Planned |
| `BLW-503` | Feature | Implement dead-code stripping for features marked `disabled: true`. | 4 SP | High | Planned |
| `BLW-504` | Feature | Configure ESM content-hashed chunk outputs (`chunks/[name].[hash].js`). | 3 SP | High | Planned |
| `BLW-505` | Tooling | Generate production `dist/index.html` with injected production import map. | 4 SP | High | Planned |
| `BLW-506` | CI | Set up GitHub Actions bundle size budget enforcement check. | 2 SP | Medium | Planned |

---

### Cycle 6: Progressive Web App Engine & Wildcard API

* **Goal:** Enable offline-first functionality and universal `Request` $\rightarrow$ `Response` dispatching.

| Issue ID | Type | Task / Story | Est. | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BLW-601` | Feature | Build `BlewApiRouter` wildcard dispatcher (`/api/:feature/:action*`). | 5 SP | Critical | Planned |
| `BLW-602` | Feature | Add export resolution: Named Action $\rightarrow$ HTTP verb $\rightarrow$ 405. | 3 SP | High | Planned |
| `BLW-603` | Feature | Build multi-tier ESM Service Worker (`sw.js`). | 5 SP | Critical | Planned |
| `BLW-604` | Feature | Run feature `endpoint.js` directly within the Service Worker offline. | 4 SP | High | Planned |
| `BLW-605` | Feature | Create `Blew.badge`, `Blew.share`, and `Blew.dialog` helpers. | 3 SP | Medium | Planned |

---

### Cycle 7: Developer CLI, Docs & 1.0 Release

* **Goal:** Package developer tooling, document the framework, and publish v1.0.

| Issue ID | Type | Task / Story | Est. | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BLW-701` | Tooling | Create `create-blew` interactive scaffolder package. | 4 SP | High | Planned |
| `BLW-702` | Tooling | Add `blew new feature <name>` CLI scaffolding command. | 4 SP | High | Planned |
| `BLW-703` | Docs | Build documentation site using Blew itself. | 5 SP | High | Planned |
| `BLW-704` | Docs | Add interactive View Transitions & Signals playground. | 3 SP | Medium | Planned |
| `BLW-705` | Release | Complete final security checks, license headers, and v1.0.0 tag. | 2 SP | Critical | Planned |

---

## 4. Solo Developer Pacing & Sustainable Flow

1. **Strict Time-Boxing:** Each work session is capped at 3 hours. When the session ends, push work-in-progress to a branch with a clean commit note.
2. **Scope Over Deadlines:** If a week yields only 9 hours instead of 15, reduce low-priority tasks rather than working overtime.
3. **No Ceremony Overhead:** Replace multi-person meetings with a personal markdown todo checklist and commit logs.
4. **Dogfooding Early:** Build the framework documentation site using Blew itself starting in Cycle 6 to catch ergonomic friction directly.