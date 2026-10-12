/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Global runtime helpers for Blew (`window.Blew`).
 * Exposes ergonomics for navigation, hardware integration (Web Badging, Web Share),
 * top-layer modal management, and constructable theme access.
 * @module @blew/global
 */

import { getOrCreateThemeSheet } from './element.js';

/**
 * Active BlewRouter instance registered during bootstrap.
 * @type {import('./router.js').BlewRouter | null}
 */
let registeredRouter = null;

/**
 * Web Badging API wrapper.
 */
class BadgeHelper {
  /**
   * Sets the device home screen or dock numeric app badge.
   *
   * @param {number} [count] - Badge count value.
   * @returns {Promise<void>}
   * @example
   * ```javascript
   * await Blew.badge.set(5);
   * ```
   */
  async set(count) {
    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator && typeof navigator.setAppBadge === 'function') {
      try {
        await navigator.setAppBadge(count);
      } catch (err) {
        console.warn('Failed to set application badge:', err);
      }
    }
  }

  /**
   * Clears the device app badge.
   *
   * @returns {Promise<void>}
   * @example
   * ```javascript
   * await Blew.badge.clear();
   * ```
   */
  async clear() {
    if (typeof navigator !== 'undefined' && 'clearAppBadge' in navigator && typeof navigator.clearAppBadge === 'function') {
      try {
        await navigator.clearAppBadge();
      } catch (err) {
        console.warn('Failed to clear application badge:', err);
      }
    }
  }
}

/**
 * Top-layer modal dialog & popover management helper.
 */
class DialogHelper {
  /**
   * Resolves a target element from a CSS selector string or Element reference.
   * @private
   * @param {string | HTMLElement} target
   * @returns {HTMLElement | null}
   */
  _resolve(target) {
    if (typeof document === 'undefined') return null;
    if (typeof target === 'string') {
      return document.querySelector(target);
    }
    if (typeof HTMLElement !== 'undefined' && target instanceof HTMLElement) {
      return target;
    }
    return null;
  }

  /**
   * Opens a native `<dialog>` or popover element by selector or ID.
   * Promotes the target to the native top layer.
   *
   * @param {string | HTMLElement} target - CSS selector or element reference.
   * @returns {void}
   * @example
   * ```javascript
   * Blew.dialog.showModal('#note-compose-dialog');
   * ```
   */
  showModal(target) {
    const el = this._resolve(target);
    if (!el) return;

    if (typeof (/** @type {HTMLDialogElement} */ (el)).showModal === 'function') {
      (/** @type {HTMLDialogElement} */ (el)).showModal();
    } else if (typeof el.showPopover === 'function') {
      el.showPopover();
    } else {
      el.setAttribute('open', '');
    }
  }

  /**
   * Closes an active top-layer modal dialog or popover.
   *
   * @param {string | HTMLElement} target - CSS selector or element reference.
   * @returns {void}
   * @example
   * ```javascript
   * Blew.dialog.close('#note-compose-dialog');
   * ```
   */
  close(target) {
    const el = this._resolve(target);
    if (!el) return;

    if (typeof (/** @type {HTMLDialogElement} */ (el)).close === 'function') {
      (/** @type {HTMLDialogElement} */ (el)).close();
    } else if (typeof el.hidePopover === 'function') {
      el.hidePopover();
    } else {
      el.removeAttribute('open');
    }
  }
}

/**
 * Global Blew runtime helper namespace.
 */
export class BlewRuntime {
  constructor() {
    /**
     * Web Badging API helper.
     * @type {BadgeHelper}
     */
    this.badge = new BadgeHelper();

    /**
     * Top-layer dialog helper.
     * @type {DialogHelper}
     */
    this.dialog = new DialogHelper();
  }

  /**
   * Registers the active router instance for global navigation delegation.
   *
   * @param {import('./router.js').BlewRouter} router
   */
  setRouter(router) {
    registeredRouter = router;
  }

  /**
   * Programmatic routing shortcut.
   *
   * @param {string} url - Target URL or path.
   * @param {object} [options] - Navigation options.
   * @returns {Promise<void>}
   * @example
   * ```javascript
   * await Blew.navigate('/notes/42');
   * ```
   */
  async navigate(url, options) {
    if (registeredRouter) {
      return registeredRouter.navigate(url, options);
    }
    if (typeof window !== 'undefined' && 'navigation' in window && window.navigation) {
      window.navigation.navigate(url, options);
      return;
    }
    if (typeof window !== 'undefined') {
      window.history.pushState(options?.state ?? null, '', url);
      window.dispatchEvent(new PopStateEvent('popstate', { state: options?.state }));
    }
  }

  /**
   * Traverses backward in browser history.
   *
   * @returns {void}
   * @example
   * ```javascript
   * Blew.back();
   * ```
   */
  back() {
    if (typeof window === 'undefined') return;
    if ('navigation' in window && window.navigation && typeof window.navigation.back === 'function') {
      window.navigation.back();
    } else {
      window.history.back();
    }
  }

  /**
   * Traverses forward in browser history.
   *
   * @returns {void}
   * @example
   * ```javascript
   * Blew.forward();
   * ```
   */
  forward() {
    if (typeof window === 'undefined') return;
    if ('navigation' in window && window.navigation && typeof window.navigation.forward === 'function') {
      window.navigation.forward();
    } else {
      window.history.forward();
    }
  }

  /**
   * Invokes the native OS share sheet using the Web Share API.
   *
   * @param {ShareData} data - Data to share (title, text, url, files).
   * @returns {Promise<void>}
   * @example
   * ```javascript
   * await Blew.share({
   *   title: 'Blew Framework',
   *   text: 'Zero-build PWA framework',
   *   url: 'https://blew.jagofr.xyz'
   * });
   * ```
   */
  async share(data) {
    if (typeof navigator !== 'undefined' && 'share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share(data);
      } catch (err) {
        if (/** @type {any} */ (err)?.name !== 'AbortError') {
          console.warn('Share failed:', err);
        }
      }
    } else {
      console.info('Web Share API is not supported in this runtime environment.', data);
    }
  }

  /**
   * Retrieves the pre-parsed singleton global theme Constructable Stylesheet.
   *
   * @returns {CSSStyleSheet | null}
   */
  getThemeSheet() {
    return getOrCreateThemeSheet();
  }
}

/**
 * Singleton instance of BlewRuntime.
 * @type {BlewRuntime}
 */
export const Blew = new BlewRuntime();

// Automatically attach to globalThis.Blew in browser environments
if (typeof globalThis !== 'undefined') {
  globalThis.Blew = Blew;
}
