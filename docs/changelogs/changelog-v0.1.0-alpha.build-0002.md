# Blew Granular Changelog: 0.1.0 ALPHA (BUILD 0002) 🍃

```
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

* **Version Tag:** `0.1.0-alpha.build-0002`
* **Semantic Display Format:** `0.1.0 ALPHA (BUILD 0002)`
* **Release Date:** 2026-10-12
* **Build Target:** Modern Evergreen Browsers (Chromium 115+, Safari 17.4+, Firefox 128+)
* **Deployment Target:** GitHub Pages Subpath (`https://<user>.github.io/<repo>/`) & Root Custom Domains
* **Core Payload Size:** 3.33 kB Brotli (sub-5 kB budget PASSED)

---

## 1. Summary of Deliverables

This milestone delivers complete GitHub Pages (`gh-pages`) compatibility and subpath hosting support for the Blew production distribution (`/dist`), resolving static asset subpath referencing, Single Page Application (SPA) routing fallbacks on direct page loads and refreshes, Service Worker subpath registration, and content-hashed chunk import rewrites.

---

## 2. Granular Module Specifications

### `@blew/router` (`src/core/router.js`)
* **Automatic Base Path Detection (`_detectBase`):** Automatically senses hosting base path from `<base href>` or GitHub Pages subpath URL structure (`window.location.hostname.endsWith('github.io')`).
* **Subpath Normalization:** Normalizes incoming route paths against `this.base`, stripping the repository root prefix before matching against route patterns.
* **Shadow DOM-Aware Link Interception:** Listens for anchor click events across open Shadow DOM boundaries using `event.composedPath()`, routing through `this.navigate()` with appropriate base-path prefixing.
* **SPA Direct Navigation Restoration:** On initial load, checks `sessionStorage` for `blew_redirect_path` (saved by `404.html`), restoring the deep path via `window.history.replaceState()` and seamlessly transitioning to the destination view.

### `@blew/api` (`src/core/api-router.js`)
* **Subpath Endpoint Resolution:** Slices incoming pathname from `/api/` forward if hosted under a repository subpath prefix (e.g., `/blew-framework/api/notes`), guaranteeing uniform WinterCG dispatching across root and subpath environments.

### ESM Service Worker (`sw.js`)
* **Relative Service Worker Registration:** Registered in `src/app.js` using relative `./sw.js` instead of absolute `/sw.js` to respect subpath scopes.
* **Subpath API Route Interception:** Checks `url.pathname.includes('/api/')` for universal offline fallback routing.
* **Offline Navigation Fallback:** Resolves navigation fallbacks against `./index.html` or `/index.html` in cache.

### Headless Production Bundler (`build.js`)
* **Relative Import Map & Assets:** Emits relative URLs in `dist/index.html` (`./manifest.webmanifest`, `./theme.[hash].css`, `./app.[hash].js`, and `./chunks/` in the inlined import map).
* **Chunk Import Rewriting:** Rewrites all relative imports in bundled chunks (`dist/chunks/ui/*.js`, `dist/chunks/features/*/*.js`, `dist/chunks/global.[hash].js`, `dist/chunks/router.[hash].js`, and `dist/routes.js`) to point directly to the resolved content-hashed chunk filenames.
* **Service Worker Asset Manifest Generation:** Automatically extracts all active emitted files into `PRECACHE_ASSETS` in `dist/sw.js` with relative paths.
* **GitHub Pages `.nojekyll` Support:** Generates `dist/.nojekyll` to disable Jekyll processing and prevent file omission.
* **GitHub Pages SPA Fallback (`dist/404.html`):** Emits standard SPA redirect handler storing full target path into `sessionStorage.getItem('blew_redirect_path')` and bouncing to repository root.
* **Resilient File Cleaning:** Enhanced `fs.rmSync()` with retry handling for virtual/locked file systems on Windows.

---

## 3. Web App Manifest (`manifest.webmanifest`)
* Configured `start_url: "./"` and `scope: "./"` to allow native PWA installation from both subpath repositories and custom root domains.
* Incremented version tag to `0.1.0 ALPHA (BUILD 0002)`.

---

## 4. Verification Suite
* **Unit Tests:** Added subpath and base option routing tests in `tests/unit/router.test.js`.
* **E2E Integration Tests:** Updated `tests/e2e/build-e2e.test.js` to assert `.nojekyll`, `404.html`, relative import map paths, and manifest subpath properties.
* **Pass Rate:** 62/62 tests passing (100%).
