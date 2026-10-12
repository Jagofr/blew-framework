/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Ultra-lightweight (< 1.5 kB) base Web Component class for Blew.
 * Provides automated Shadow DOM encapsulation, Constructable Stylesheet ingestion
 * and deduplication, template literal caching, and automated lifecycle teardown.
 * @module @blew/core
 */

/**
 * In-memory cache for compiled Constructable Stylesheets.
 * Guarantees that multiple component instances sharing identical CSS text
 * share a single CSSStyleSheet instance in browser memory.
 */
class StyleSheetCacheManager {
  constructor() {
    /**
     * @private
     * @type {Map<string, CSSStyleSheet>}
     */
    this._cache = new Map();
  }

  /**
   * Retrieves an existing compiled CSSStyleSheet or compiles and caches a new one.
   *
   * @param {string} cssText - Raw CSS source string.
   * @returns {CSSStyleSheet | null} Compiled stylesheet instance, or null if unsupported.
   */
  getOrCreate(cssText) {
    if (typeof CSSStyleSheet === 'undefined') {
      return null;
    }

    if (this._cache.has(cssText)) {
      return /** @type {CSSStyleSheet} */ (this._cache.get(cssText));
    }

    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(cssText);
      this._cache.set(cssText, sheet);
      return sheet;
    } catch {
      return null;
    }
  }

  /**
   * Clears the internal stylesheet cache.
   */
  clear() {
    this._cache.clear();
  }
}

/**
 * Singleton instance of the constructable stylesheet cache.
 * @type {StyleSheetCacheManager}
 */
export const StyleSheetCache = new StyleSheetCacheManager();

/**
 * Global default theme constructable stylesheet singleton.
 * @type {CSSStyleSheet | null}
 */
let globalThemeSheet = null;

/**
 * Sets or retrieves the global theme Constructable Stylesheet.
 *
 * @param {CSSStyleSheet | string} [sheetOrCss] - Optional sheet or CSS string to set as theme.
 * @returns {CSSStyleSheet | null} Active theme stylesheet.
 */
export function getOrCreateThemeSheet(sheetOrCss) {
  if (sheetOrCss) {
    if (sheetOrCss instanceof CSSStyleSheet) {
      globalThemeSheet = sheetOrCss;
    } else if (typeof sheetOrCss === 'string') {
      globalThemeSheet = StyleSheetCache.getOrCreate(sheetOrCss);
    }
  }

  if (!globalThemeSheet && typeof CSSStyleSheet !== 'undefined') {
    // Basic fallback theme variables if none loaded externally
    const defaultTokens = `
      :host {
        color-scheme: light dark;
      }
    `;
    globalThemeSheet = StyleSheetCache.getOrCreate(defaultTokens);
  }

  return globalThemeSheet;
}

/**
 * In-memory cache for parsed HTML <template> elements keyed by template string structure.
 * @type {Map<string, HTMLTemplateElement>}
 */
const templateCache = new Map();

/**
 * Safe base class resolution for isomorphic / test environments where
 * HTMLElement may not exist natively.
 * @type {typeof HTMLElement}
 */
const BaseHTMLElement = typeof HTMLElement !== 'undefined'
  ? HTMLElement
  : /** @type {any} */ (class MockHTMLElement {});

/**
 * BlewElement - Foundational custom element base class.
 * Extend this class to construct reactive, scoped, standards-native UI components.
 *
 * @extends {HTMLElement}
 */
export class BlewElement extends BaseHTMLElement {
  /**
   * Constructs a BlewElement instance and attaches an encapsulated ShadowRoot.
   *
   * @param {object} [options={}] - Shadow DOM initialization options.
   * @param {'open' | 'closed'} [options.mode='open'] - Shadow root encapsulation mode.
   * @param {boolean} [options.delegatesFocus=false] - Whether focus delegates to first child.
   */
  constructor(options = {}) {
    super();

    /**
     * Active route parameters injected by the Blew router when mounted.
     * @type {Record<string, string>}
     */
    this.params = {};

    /**
     * Internal registry of lifecycle disposers to invoke on disconnect.
     * @private
     * @type {Set<() => void>}
     */
    this._disposers = new Set();

    if (typeof this.attachShadow === 'function') {
      this.attachShadow({
        mode: options.mode ?? 'open',
        delegatesFocus: options.delegatesFocus ?? false
      });
    }
  }

  /**
   * Adopts Constructable Stylesheets into this element's ShadowRoot.
   * Automatically prepends the global theme stylesheet (index 0) and deduplicates
   * incoming CSS strings using the shared StyleSheetCache.
   *
   * @param {...(string | CSSStyleSheet | Array<string | CSSStyleSheet>)} styles - Stylesheets or CSS strings.
   * @returns {void}
   * @example
   * ```javascript
   * const styles = `:host { display: block; padding: 1rem; }`;
   * this.adoptStyles(styles);
   * ```
   */
  adoptStyles(...styles) {
    if (!this.shadowRoot || !('adoptedStyleSheets' in this.shadowRoot)) {
      return;
    }

    const flatStyles = styles.flat(Infinity);
    /** @type {CSSStyleSheet[]} */
    const resolvedSheets = [];

    // Prepend global theme sheet at index 0 if available
    const themeSheet = getOrCreateThemeSheet();
    if (themeSheet) {
      resolvedSheets.push(themeSheet);
    }

    for (const item of flatStyles) {
      if (typeof CSSStyleSheet !== 'undefined' && item instanceof CSSStyleSheet) {
        if (!resolvedSheets.includes(item)) {
          resolvedSheets.push(item);
        }
      } else if (typeof item === 'string') {
        const compiled = StyleSheetCache.getOrCreate(item);
        if (compiled && !resolvedSheets.includes(compiled)) {
          resolvedSheets.push(compiled);
        }
      }
    }

    this.shadowRoot.adoptedStyleSheets = resolvedSheets;
  }

  /**
   * Tagged template literal helper that parses markup using an in-memory
   * `<template>` cache and returns a cloned DocumentFragment.
   * Avoids repeated innerHTML string parsing overhead.
   *
   * @param {TemplateStringsArray} strings - Template literal static string parts.
   * @param {...unknown} values - Template literal interpolated values.
   * @returns {DocumentFragment} Cloned DocumentFragment ready to mount.
   * @example
   * ```javascript
   * const fragment = this.html`
   *   <article class="card">
   *     <h3>${this.title}</h3>
   *   </article>
   * `;
   * this.shadowRoot.replaceChildren(fragment);
   * ```
   */
  html(strings, ...values) {
    if (typeof document === 'undefined') {
      return /** @type {any} */ ({});
    }

    // Build raw interpolated markup
    let markup = '';
    for (let i = 0; i < strings.length; i++) {
      markup += strings[i];
      if (i < values.length) {
        const val = values[i];
        if (val === null || val === undefined) {
          markup += '';
        } else if (Array.isArray(val)) {
          markup += val.join('');
        } else {
          markup += String(val);
        }
      }
    }

    const cacheKey = strings.join('__BLEW_PART__');
    let template = templateCache.get(cacheKey);

    if (!template) {
      template = document.createElement('template');
      template.innerHTML = markup;
      templateCache.set(cacheKey, template);
    } else {
      // Re-populate innerHTML if values are dynamic
      template.innerHTML = markup;
    }

    return template.content.cloneNode(true);
  }

  /**
   * Registers a cleanup or cancellation function.
   * Every disposer registered via `subscribe()` is automatically executed when
   * `disconnectedCallback()` fires, preventing memory leaks from reactive signals,
   * intervals, or global event listeners.
   *
   * @param {() => void} disposer - Cleanup or unsubscribe callback.
   * @returns {() => void} Disposer function for early manual disposal.
   * @example
   * ```javascript
   * connectedCallback() {
   *   const unsubscribe = count.subscribe(val => { ... });
   *   this.subscribe(unsubscribe);
   * }
   * ```
   */
  subscribe(disposer) {
    if (typeof disposer !== 'function') {
      return () => {};
    }

    this._disposers.add(disposer);

    return () => {
      this._disposers.delete(disposer);
      try {
        disposer();
      } catch (err) {
        console.error('Error during manual disposal in BlewElement:', err);
      }
    };
  }

  /**
   * Dispatches a standard CustomEvent with sensible defaults.
   * Configured by default with `bubbles: true`, `composed: true` (penetrates Shadow DOM),
   * and `cancelable: true`.
   *
   * @param {string} eventName - Custom event type name.
   * @param {unknown} [detail=null] - Optional event payload.
   * @param {CustomEventInit} [options={}] - Additional CustomEventInit overrides.
   * @returns {boolean} `false` if event is cancelable and was prevented, `true` otherwise.
   * @example
   * ```javascript
   * this.dispatch('b-note-deleted', { id: this.params.id });
   * ```
   */
  dispatch(eventName, detail = null, options = {}) {
    if (typeof CustomEvent === 'undefined' || typeof this.dispatchEvent !== 'function') {
      return true;
    }

    const event = new CustomEvent(eventName, {
      bubbles: options.bubbles ?? true,
      composed: options.composed ?? true,
      cancelable: options.cancelable ?? true,
      detail,
      ...options
    });

    return this.dispatchEvent(event);
  }

  /**
   * Native lifecycle hook invoked when the element is disconnected from the DOM.
   * Automatically executes all registered cleanup disposers.
   *
   * @returns {void}
   */
  disconnectedCallback() {
    for (const disposer of this._disposers) {
      try {
        disposer();
      } catch (err) {
        console.error('Error executing disposer during BlewElement disconnect:', err);
      }
    }
    this._disposers.clear();
  }
}
