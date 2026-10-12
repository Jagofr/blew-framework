/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Cross-runtime environment detection bridge for Blew.
 * Provides unified environment state resolution across unbundled browser runtimes,
 * Service Workers, and compiled production artifacts.
 * @module @blew/env
 */

/**
 * @typedef {'development' | 'production'} EnvironmentMode
 */

/**
 * Environment detection utility object.
 * Resolves application mode via `globalThis.__APP_ENV__`, `process.env.NODE_ENV`,
 * or falls back safely to 'development'.
 */
class EnvironmentDetector {
  /**
   * Retrieves the current environment execution mode.
   * Checks browser global `__APP_ENV__`, followed by Node/Bun `process.env.NODE_ENV`.
   * Defaults to `'development'` if neither is configured.
   *
   * @returns {EnvironmentMode} The active execution environment mode.
   */
  get mode() {
    if (typeof globalThis !== 'undefined' && globalThis.__APP_ENV__) {
      return globalThis.__APP_ENV__ === 'production' ? 'production' : 'development';
    }

    if (
      typeof process !== 'undefined' &&
      process.env &&
      process.env.NODE_ENV === 'production'
    ) {
      return 'production';
    }

    return 'development';
  }

  /**
   * Checks whether the framework is running in production mode.
   *
   * @returns {boolean} `true` if operating in production, `false` otherwise.
   * @example
   * ```javascript
   * if (ENV.isProd()) {
   *   // Production-only optimizations
   * }
   * ```
   */
  isProd() {
    return this.mode === 'production';
  }

  /**
   * Checks whether the framework is running in development mode.
   *
   * @returns {boolean} `true` if operating in development, `false` otherwise.
   * @example
   * ```javascript
   * if (ENV.isDev()) {
   *   console.info('Running in unbundled development mode');
   * }
   * ```
   */
  isDev() {
    return this.mode === 'development';
  }
}

/**
 * Singleton instance of EnvironmentDetector.
 * @type {EnvironmentDetector}
 */
export const ENV = new EnvironmentDetector();

