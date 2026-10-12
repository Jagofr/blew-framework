/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Client-side routing engine integrating the native Navigation API,
 * WHATWG URLPattern, and direction-aware View Transitions API.
 * @module @blew/router
 */

/**
 * @typedef {import('./router-utils.js').ViewRouteEntry} ViewRouteEntry
 */

/**
 * @typedef {object} RouterOptions
 * @property {string} [fallbackTag] - Custom element tag to mount if no route matches.
 * @property {boolean} [enableTransitions=true] - Whether to coordinate with document.startViewTransition().
 */

/**
 * @typedef {object} RouteMatchResult
 * @property {ViewRouteEntry} route - Matched route entry.
 * @property {Record<string, string>} params - Extracted route parameters.
 */

/**
 * BlewRouter manages client-side single-page app routing.
 * Leverages `window.navigation` when available, falling back gracefully to
 * click interception and `window.history` for other browsers.
 */
export class BlewRouter {
  /**
   * Initializes the client router.
   *
   * @param {ViewRouteEntry[]} routes - Array of active view route definitions.
   * @param {HTMLElement | null} outlet - Target container where views will be mounted.
   * @param {RouterOptions} [options={}] - Optional configuration options.
   */
  constructor(routes, outlet, options = {}) {
    /**
     * Registered view route entries.
     * @type {ViewRouteEntry[]}
     */
    this.routes = Array.isArray(routes) ? routes : [];

    /**
     * DOM container into which active views are rendered.
     * @type {HTMLElement | null}
     */
    this.outlet = outlet;

    /**
     * Configuration options.
     * @type {RouterOptions & { base?: string }}
     */
    this.options = {
      enableTransitions: true,
      ...options
    };

    /**
     * Base hosting subpath (e.g., '/blew-framework' on GitHub Pages).
     * @type {string}
     */
    const detectedBase = this._detectBase();
    this.base = (options.base !== undefined ? options.base : detectedBase).replace(/\/$/, '');

    /**
     * Compiled URLPattern instances paired with their route definitions.
     * @private
     * @type {Array<{ pattern: URLPattern, route: ViewRouteEntry }>}
     */
    this._compiledRoutes = [];

    /**
     * Tracked navigation history index for directional vector calculations.
     * @private
     * @type {number}
     */
    this._currentIndex = 0;

    /**
     * Active synthetic history entry for fallback environments.
     * @private
     * @type {object | null}
     */
    this._fallbackEntry = null;

    this._compileRoutes();

    if (typeof window !== 'undefined') {
      this._setupNavigationListener();
      // Initial route resolution on boot
      this._resolveCurrentLocation();
    }
  }

  /**
   * Automatically detects the base hosting path from `<base href>` or GitHub Pages URL structure.
   * @private
   * @returns {string} Detected base path (e.g., '/blew-framework' or '').
   */
  _detectBase() {
    if (typeof document !== 'undefined') {
      const baseTag = document.querySelector('base');
      if (baseTag && baseTag.getAttribute('href')) {
        try {
          const href = baseTag.getAttribute('href') || '';
          return new URL(href, window.location.origin).pathname.replace(/\/$/, '');
        } catch {
          // Ignore malformed base href
        }
      }
    }

    if (typeof window !== 'undefined' && window.location?.hostname?.endsWith('github.io')) {
      const segments = window.location.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        return `/${segments[0]}`;
      }
    }

    return '';
  }

  /**
   * Pre-compiles route pattern strings into WHATWG URLPattern instances.
   * @private
   */
  _compileRoutes() {
    if (typeof URLPattern === 'undefined') return;

    this._compiledRoutes = this.routes.map((route) => {
      const pattern = new URLPattern({ pathname: route.pattern });
      return { pattern, route };
    });
  }

  /**
   * Sets up native Navigation API and Shadow DOM-aware link click listeners.
   * @private
   */
  _setupNavigationListener() {
    if ('navigation' in window && window.navigation) {
      this._currentIndex = window.navigation.currentEntry?.index ?? 0;

      window.navigation.addEventListener('navigate', (event) => {
        if (!event.canIntercept || event.downloadRequest || event.formData) {
          return;
        }

        const url = new URL(event.destination.url);
        if (url.origin !== window.location.origin) {
          return;
        }

        // Determine transition direction vector
        let vector = 'b-nav-forward';
        if (event.navigationType === 'replace') {
          vector = 'b-nav-replace';
        } else if (event.destination.index !== -1) {
          if (event.destination.index < this._currentIndex) {
            vector = 'b-nav-backward';
          } else if (event.destination.index > this._currentIndex) {
            vector = 'b-nav-forward';
          }
          this._currentIndex = event.destination.index;
        }

        event.intercept({
          handler: async () => {
            await this._handleTransition(url.pathname, vector);
          }
        });
      });
    } else {
      // Fallback for browsers without Navigation API (Safari/Firefox)
      window.addEventListener('popstate', (event) => {
        const url = new URL(window.location.href);
        this._fallbackEntry = {
          getState: () => event.state,
          key: String(Date.now())
        };
        this._handleTransition(url.pathname, 'b-nav-backward');
      });
    }

    // Intercept anchor clicks across Shadow DOM via composedPath() to ensure
    // subpath base prefixes (e.g. GitHub Pages /repo-name) and fallback routing work seamlessly
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        const path = typeof event.composedPath === 'function' ? event.composedPath() : [event.target];
        let anchor = null;
        for (const node of path) {
          if (node instanceof Element && node.tagName === 'A') {
            anchor = /** @type {HTMLAnchorElement} */ (node);
            break;
          }
        }

        if (!anchor || anchor.target || anchor.hasAttribute('download')) return;

        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('mailto:')) {
          return;
        }

        // If base path is active or Navigation API is absent, handle via router.navigate()
        if (this.base || !('navigation' in window && window.navigation)) {
          event.preventDefault();
          this.navigate(href);
        }
      });
    }
  }

  /**
   * Resolves the route for the current browser location immediately on initialization.
   * Restores any SPA redirect path saved by 404.html on static hosts like GitHub Pages.
   * @private
   */
  async _resolveCurrentLocation() {
    if (typeof window === 'undefined') return;

    try {
      const redirected = window.sessionStorage?.getItem('blew_redirect_path');
      if (redirected) {
        window.sessionStorage.removeItem('blew_redirect_path');
        window.history.replaceState(null, '', redirected);
      }
    } catch {
      // Ignore sessionStorage errors in restricted contexts
    }

    const pathname = window.location.pathname;
    await this._handleTransition(pathname, 'b-nav-replace');
  }

  /**
   * Coordinates view mounting, element instantiation, and View Transitions.
   *
   * @private
   * @param {string} pathname - Target URL pathname.
   * @param {string} vector - Direction vector class ('b-nav-forward', 'b-nav-backward', 'b-nav-replace').
   * @returns {Promise<void>}
   */
  async _handleTransition(pathname, vector) {
    const match = this.match(pathname);

    const mountTask = async () => {
      if (!this.outlet) return;

      if (match) {
        if (typeof match.route.load === 'function') {
          await match.route.load();
        }

        const viewElement = document.createElement(match.route.tag);
        // Inject matched parameters
        /** @type {any} */ (viewElement).params = match.params;

        this.outlet.replaceChildren(viewElement);
      } else if (this.options.fallbackTag) {
        const fallbackElement = document.createElement(this.options.fallbackTag);
        this.outlet.replaceChildren(fallbackElement);
      } else {
        const notFound = document.createElement('div');
        notFound.className = 'b-not-found';
        notFound.textContent = '404 - Page Not Found';
        this.outlet.replaceChildren(notFound);
      }
    };

    if (
      this.options.enableTransitions &&
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      typeof document.startViewTransition === 'function'
    ) {
      const root = document.documentElement;
      root.classList.remove('b-nav-forward', 'b-nav-backward', 'b-nav-replace');
      root.classList.add(vector);

      try {
        const transition = document.startViewTransition(mountTask);
        await transition.finished;
      } finally {
        root.classList.remove(vector);
      }
    } else {
      await mountTask();
    }
  }

  /**
   * Strips configured base path prefix and normalizes pathname for route matching.
   *
   * @param {string} pathname - Raw pathname (e.g., '/blew-framework/notes/42').
   * @returns {string} Normalized route pathname (e.g., '/notes/42').
   */
  normalizePath(pathname) {
    let normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
    if (this.base && normalized.startsWith(this.base)) {
      const rest = normalized.slice(this.base.length);
      if (!rest || rest.startsWith('/')) {
        normalized = rest || '/';
      }
    }
    // Strip trailing index.html if present on static hosts
    if (normalized.endsWith('/index.html')) {
      normalized = normalized.slice(0, -10) || '/';
    }
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }

  /**
   * Matches a pathname against the registered route patterns using standard WHATWG URLPattern.
   * Automatically strips any active base path prefix before testing patterns.
   *
   * @param {string} pathname - Pathname to evaluate (e.g., '/notes/42' or '/repo/notes/42').
   * @returns {RouteMatchResult | null} Matched route definition and parameters, or null.
   * @example
   * ```javascript
   * const match = router.match('/notes/42');
   * if (match) {
   *   console.log(match.route.tag, match.params.subview);
   * }
   * ```
   */
  match(pathname) {
    if (typeof URLPattern === 'undefined') {
      return null;
    }

    const normalizedPath = this.normalizePath(pathname);

    for (const { pattern, route } of this._compiledRoutes) {
      const result = pattern.exec({ pathname: normalizedPath });
      if (result) {
        /** @type {Record<string, string>} */
        const params = {};
        const pathnameGroups = result.pathname?.groups || {};

        for (const [key, value] of Object.entries(pathnameGroups)) {
          if (value !== undefined) {
            params[key] = value;
          }
        }

        return { route, params };
      }
    }

    return null;
  }

  /**
   * Programmatically navigates to a new URL using the native Navigation API pipeline
   * or standard history fallback. Automatically prepends base path when configured.
   *
   * @param {string} url - Target URL or path to navigate to.
   * @param {object} [options={}] - Navigation options including state.
   * @param {unknown} [options.state] - State to persist with this history entry.
   * @param {object} [options.info] - Ephemeral info passed to navigate event.
   * @returns {Promise<void>}
   * @example
   * ```javascript
   * await router.navigate('/notes/42', { state: { fromList: true } });
   * ```
   */
  async navigate(url, options = {}) {
    if (typeof window === 'undefined') return;

    let targetUrl = url;
    if (
      this.base &&
      !url.startsWith('http://') &&
      !url.startsWith('https://') &&
      !url.startsWith('//')
    ) {
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      if (!cleanUrl.startsWith(`${this.base}/`) && cleanUrl !== this.base) {
        targetUrl = cleanUrl === '/' ? `${this.base}/` : `${this.base}${cleanUrl}`;
      }
    }

    if ('navigation' in window && window.navigation && typeof window.navigation.navigate === 'function') {
      try {
        window.navigation.navigate(targetUrl, options);
        return;
      } catch (err) {
        console.warn('Navigation API navigate failed, falling back to history:', err);
      }
    }

    // Fallback via History API
    window.history.pushState(options.state ?? null, '', targetUrl);
    this._fallbackEntry = {
      getState: () => options.state ?? null,
      key: String(Date.now())
    };
    const parsed = new URL(targetUrl, window.location.origin);
    await this._handleTransition(parsed.pathname, 'b-nav-forward');
  }

  /**
   * Returns the current NavigationHistoryEntry or synthetic fallback entry.
   *
   * @returns {object | null} The active history entry with getState() and key access.
   */
  currentEntry() {
    if (typeof window !== 'undefined' && 'navigation' in window && window.navigation) {
      return window.navigation.currentEntry;
    }
    return this._fallbackEntry;
  }
}

