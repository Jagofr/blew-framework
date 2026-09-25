# Contributing to Blew 🍃

```
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

Thank you for your interest in contributing to Blew! We welcome contributions that help push the boundaries of standards-native, zero-dependency progressive web applications.

Please review this document carefully before opening an issue, submitting a pull request, or proposing architectural modifications.

---

## ⚖️ Contributor License Agreement & Upstream Rights Grant

Blew is licensed under the **Asymmetric Copyleft to Permanent Non-Commercial License (ACPNCL) Version 1.0**.

By submitting code, documentation, patches, or pull requests to the `Jagofr/blew-framework` repository:

1. **Upstream Rights Assignment:** You grant the original Author (`Jagofr`) and project maintainers an irrevocable, worldwide, perpetual, royalty-free, non-exclusive license to use, modify, sublicense, or commercially exploit your contributed code under separate terms, in accordance with Section 2 of ACPNCL v1.0.
2. **Non-Commercial Reciprocity:** You agree that your contributions will be distributed publicly under the non-commercial copyleft terms of ACPNCL v1.0.
3. **Original Work Certification:** You certify that the submitted work is your original creation or that you possess the explicit legal rights and permissions to submit it under these terms.

If you cannot or do not agree to these terms, please do not submit code or pull requests to this project.

---

## 🧭 Architectural Invariants

Every contribution must honor the foundational tenets of Blew:

1. **Zero External Runtime Dependencies:** The runtime core (`@blew/core`, `@blew/signals`, `@blew/router`, `@blew/api`, `@blew/router-utils`, `@blew/env`) must remain **0 npm dependencies**. Do not introduce external third-party runtime packages.
2. **Platform Delegation:** If an evergreen browser provides a native mechanism (such as the Navigation API, `URLPattern`, Constructable Stylesheets, `<dialog>`, the `popover` API, or the View Transitions API), Blew delegates to that primitive instead of maintaining synthetic wrappers or Virtual DOM abstractions.
3. **Zero-Build Development by Default:** Unbundled source files must run directly in modern browsers via native `<script type="importmap">` and native ES modules. Development workflows must never require a compulsory compiler, transpiler, or bundler.
4. **Vertical Slice Cohesion:** Features must remain self-contained inside `src/features/<feature-name>/`. Avoid cross-feature couplings unless mediated through standard custom events or explicit signal stores.
5. **Atomic Feature Flags:** Features must pair their UI and API surfaces under a unified manifest block in `src/routes.js` with an atomic `disabled: boolean` flag.

---

## 🛠️ Local Development Setup

Because Blew requires no compilation step for local development, setup is instantaneous:

### Prerequisites

* A modern browser supporting ES modules, Import Maps, and the Navigation API (Chromium 115+, or modern Safari / Firefox with standard polyfill detection).
* Any static HTTP file server (`npx serve`, `bunx serve`, Python `http.server`, Caddy, etc.).
* Node.js (v20+) or Bun (v1.0+) if you plan to run automated tests or the optional production compiler (`build.js`).

### Getting Started

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/Jagofr/blew-framework.git
   cd blew-framework
   ```

2. **Start the local server:**
   Launch any static HTTP server from the project root:
   ```bash
   # Using npx
   npx serve . -l 3000

   # Or using Bun
   bunx serve . -p 3000

   # Or using Python
   python3 -m http.server 3000
   ```

3. **Open the application:**
   Navigate to `http://localhost:3000`. You are now running Blew in native, unbundled development mode with instant 0ms reload feedback.

4. **Verify the optional production compiler (optional):**
   ```bash
   npm run build
   npx serve dist -l 3001
   ```

---

## 📐 Code Style & Conventions

### 1. Naming & Prefixes

* **Custom Elements:** Prefix with `b-` (e.g., `<b-shell>`, `<b-notes-view>`, `<b-dialog>`).
* **CSS Transition Keyframes:** Prefix with `b-` (e.g., `b-slide-out`, `b-fade-in`).
* **Custom Attributes / Directives:** Prefix with `b-` (e.g., `<a href="/notes" b-link>`).
* **Module Specifiers:** Use the standardized `@blew/` and `@features/` aliases configured in `index.html`'s native import map.

### 2. JavaScript / ECMAScript

* Use modern, standard ES2022+ syntax: optional chaining (`?.`), nullish coalescing (`??`), top-level `await`, dynamic imports (`import()`).
* Always specify explicit `.js` file extensions in relative module imports (`import { BlewElement } from './element.js';`).
* Do not introduce Babel, TypeScript compilation steps, or polyfills into the runtime source directory (`src/core/`). Use clean JSDoc comments for type hints.

### 3. CSS & Styles

* Prefer **Constructable Stylesheets** (`adoptedStyleSheets`) for element-scoped styling.
* Use native **CSS `@scope`** to isolate component rules and prevent slot bleeding.
* Rely on CSS Custom Properties (`--b-color-*`, `--b-font-*`, `--b-radius-*`) and native `light-dark()` color notation.

### 4. File Headers

Every new source file contributed to the repository must begin with the standard ACPNCL header:

```javascript
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

---

## 🔀 Submitting Pull Requests

1. **Search Existing Issues:** Before embarking on substantial work, check [GitHub Issues](https://github.com/Jagofr/blew-framework/issues) to discuss proposed changes.
2. **Branch Naming:**
   * `feat/feature-name` for new features or capabilities.
   * `fix/issue-description` for bug fixes.
   * `docs/topic-name` for documentation updates.
3. **Commit Messages:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   * `feat(router): add direction-aware transition classes`
   * `fix(element): prevent memory leak on disconnectedCallback signal unsubscription`
   * `docs(api): document BlewApiRouter action resolution order`
4. **Pull Request Quality:**
   * Clearly explain what was changed, why, and how it was tested.
   * Reference related issues (`Fixes #12`, `Closes #5`).
   * Verify that no external dependencies were added to `src/core/`.

---

## 💬 Community & Stewardship

* **Repository:** [github.com/Jagofr/blew-framework](https://github.com/Jagofr/blew-framework)
* **Official Website:** [blew.jagofr.xyz](https://blew.jagofr.xyz)
* **Documentation Portal:** [docs.blew.jagofr.xyz](https://docs.blew.jagofr.xyz)
* **Author & Stewardship Inquiries:** Check the contact details on [blew.jagofr.xyz](https://blew.jagofr.xyz)