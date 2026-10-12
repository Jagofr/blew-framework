/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { extractActiveRoutes } from '../../src/core/router-utils.js';

describe('Route Manifest Normalization (@blew/router-utils)', () => {
  test('extracts views and apis from active features', () => {
    const mockFeatures = [
      {
        name: 'home',
        view: { pattern: '/', tag: 'b-home-view', load: () => Promise.resolve() }
      },
      {
        name: 'notes',
        view: { pattern: '/notes', tag: 'b-notes-view', load: () => Promise.resolve() },
        api: { pattern: '/api/notes', load: () => Promise.resolve() }
      }
    ];

    const { views, apis } = extractActiveRoutes(mockFeatures);

    assert.equal(views.length, 2);
    assert.equal(apis.length, 1);
    assert.equal(views[0].tag, 'b-home-view');
    assert.equal(views[1].tag, 'b-notes-view');
    assert.equal(apis[0].pattern, '/api/notes');
  });

  test('filters out features marked with disabled: true', () => {
    const mockFeatures = [
      {
        name: 'active-feat',
        disabled: false,
        view: { pattern: '/active', tag: 'b-active', load: () => Promise.resolve() },
        api: { pattern: '/api/active', load: () => Promise.resolve() }
      },
      {
        name: 'disabled-feat',
        disabled: true,
        view: { pattern: '/disabled', tag: 'b-disabled', load: () => Promise.resolve() },
        api: { pattern: '/api/disabled', load: () => Promise.resolve() }
      }
    ];

    const { views, apis } = extractActiveRoutes(mockFeatures);

    assert.equal(views.length, 1);
    assert.equal(apis.length, 1);
    assert.equal(views[0].feature, 'active-feat');
    assert.equal(apis[0].feature, 'active-feat');
  });

  test('handles empty, null, or malformed input gracefully', () => {
    assert.deepEqual(extractActiveRoutes(), { views: [], apis: [] });
    assert.deepEqual(extractActiveRoutes(null), { views: [], apis: [] });
    assert.deepEqual(extractActiveRoutes([null, undefined, {}]), { views: [], apis: [] });
  });
});

