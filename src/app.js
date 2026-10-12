/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Application bootstrap and client runtime initialization.
 * Normalizes active routes, mounts the BlewRouter, binds global Blew runtime helpers,
 * and registers the offline ESM Service Worker.
 * @module app
 */

import { features } from './routes.js';
import { extractActiveRoutes } from './core/router-utils.js';
import { BlewRouter } from './core/router.js';
import { Blew } from './core/global.js';

// Preload shell components
import './components/b-shell.js';
import './components/b-dialog.js';

/**
 * Active extracted view and API routes.
 */
export const { views, apis } = extractActiveRoutes(features);

/**
 * Global application router instance.
 * @type {BlewRouter | null}
 */
export let router = null;

/**
 * Bootstraps the application runtime.
 * Mounts the router to #b-outlet and initializes service worker caching.
 *
 * @returns {BlewRouter | null}
 */
export function bootstrap() {
  if (typeof document === 'undefined') return null;

  const outlet = document.querySelector('#b-outlet');
  router = new BlewRouter(views, outlet, {
    enableTransitions: true,
    fallbackTag: 'b-home-view'
  });

  Blew.setRouter(router);

  // Register ESM Service Worker in supporting environments
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { type: 'module' })
        .then((reg) => {
          console.info('Blew Service Worker active with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('Blew Service Worker registration skipped:', err);
        });
    });
  }

  return router;
}

// Automatically bootstrap when executed in browser document
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bootstrap());
  } else {
    bootstrap();
  }
}

export { Blew };
