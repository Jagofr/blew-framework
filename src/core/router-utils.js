/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Manifest ingestion, atomic feature-flag normalization, and route extraction.
 * Ingests the unified feature list declared in src/routes.js and flattens active UI views
 * and API endpoints while stripping disabled feature slices.
 * @module @blew/router-utils
 */

/**
 * @typedef {object} ViewRouteEntry
 * @property {string} [feature] - Name of the parent feature domain.
 * @property {string} pattern - URLPattern pathname pattern string (e.g., '/notes/:id*').
 * @property {string} tag - Custom element tag name to instantiate and mount (e.g., 'b-notes-view').
 * @property {() => Promise<unknown>} load - Dynamic import function returning the module.
 */

/**
 * @typedef {object} ApiRouteEntry
 * @property {string} [feature] - Name of the parent feature domain.
 * @property {string} pattern - URLPattern pathname pattern string (e.g., '/api/notes/:action*').
 * @property {() => Promise<unknown>} load - Dynamic import function returning the API module exports.
 */

/**
 * @typedef {object} FeatureModuleDefinition
 * @property {string} name - Domain name of the feature slice.
 * @property {boolean} [disabled=false] - Atomic kill-switch disabling both UI view and API endpoint.
 * @property {ViewRouteEntry} [view] - Client-side UI view definition.
 * @property {ApiRouteEntry} [api] - Universal WinterCG API route definition.
 */

/**
 * @typedef {object} ExtractedRoutes
 * @property {ViewRouteEntry[]} views - Active client view routes.
 * @property {ApiRouteEntry[]} apis - Active API endpoint routes.
 */

/**
 * Parses the unified feature definitions array from `src/routes.js`.
 * Filters out any feature marked `disabled: true` and segregates active UI views
 * and API endpoints into dedicated arrays for the respective routers.
 *
 * @param {FeatureModuleDefinition[]} [featureList=[]] - Array of feature module declarations.
 * @returns {ExtractedRoutes} Normalized active views and API routes.
 * @example
 * ```javascript
 * import { features } from './src/routes.js';
 * import { extractActiveRoutes } from '@blew/router-utils';
 *
 * const { views, apis } = extractActiveRoutes(features);
 * ```
 */
export function extractActiveRoutes(featureList = []) {
  /** @type {ViewRouteEntry[]} */
  const views = [];
  /** @type {ApiRouteEntry[]} */
  const apis = [];

  if (!Array.isArray(featureList)) {
    return { views, apis };
  }

  for (const feature of featureList) {
    if (!feature || typeof feature !== 'object') {
      continue;
    }

    // Skip disabled features entirely
    if (Boolean(feature.disabled)) {
      continue;
    }

    if (feature.view && typeof feature.view === 'object') {
      views.push({
        feature: feature.name,
        pattern: feature.view.pattern,
        tag: feature.view.tag,
        load: feature.view.load
      });
    }

    if (feature.api && typeof feature.api === 'object') {
      apis.push({
        feature: feature.name,
        pattern: feature.api.pattern,
        load: feature.api.load
      });
    }
  }

  return { views, apis };
}
