/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Unified Feature Manifest for Blew.
 * Pairs client UI views and universal API endpoints under atomic feature slices
 * with single-flag kill-switches (`disabled: boolean`).
 * @module routes
 */

import { ENV } from './core/env.js';

/**
 * Master feature declaration manifest.
 * @type {import('./core/router-utils.js').FeatureModuleDefinition[]}
 */
export const features = [
  {
    name: 'home',
    disabled: false,
    view: {
      pattern: '/',
      tag: 'b-home-view',
      load: () => import('./features/home/home-view.js')
    }
  },
  {
    name: 'counter',
    disabled: false,
    view: {
      pattern: '/counter/:action*',
      tag: 'b-counter-view',
      load: () => import('./features/counter/counter-view.js')
    },
    api: {
      pattern: '/api/counter/:action*',
      load: () => import('./features/counter/endpoint.js')
    }
  },
  {
    name: 'notes',
    disabled: false,
    view: {
      pattern: '/notes/:subview*',
      tag: 'b-notes-view',
      load: () => import('./features/notes/notes-view.js')
    },
    api: {
      pattern: '/api/notes/:action*',
      load: () => import('./features/notes/endpoint.js')
    }
  },
  {
    name: 'ai-summary',
    // Example dark-launched feature slice disabled by default
    disabled: true,
    view: {
      pattern: '/ai/:action*',
      tag: 'b-ai-view',
      load: () => Promise.resolve({})
    },
    api: {
      pattern: '/api/ai/:action*',
      load: () => Promise.resolve({})
    }
  }
];

