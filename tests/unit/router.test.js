/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { BlewRouter } from '../../src/core/router.js';

describe('Client Router Engine (@blew/router)', () => {
  const routes = [
    {
      feature: 'home',
      pattern: '/',
      tag: 'b-home-view',
      load: () => Promise.resolve()
    },
    {
      feature: 'counter',
      pattern: '/counter/:action*',
      tag: 'b-counter-view',
      load: () => Promise.resolve()
    },
    {
      feature: 'notes',
      pattern: '/notes/:subview*',
      tag: 'b-notes-view',
      load: () => Promise.resolve()
    }
  ];

  const router = new BlewRouter(routes, null, {
    fallbackTag: 'b-not-found-view',
    enableTransitions: false
  });

  test('matches exact root pattern', () => {
    const match = router.match('/');
    assert.ok(match);
    assert.equal(match.route.tag, 'b-home-view');
    assert.deepEqual(match.params, {});
  });

  test('matches dynamic pattern with wildcard/parameter', () => {
    const match = router.match('/notes/42');
    assert.ok(match);
    assert.equal(match.route.tag, 'b-notes-view');
    assert.equal(match.params.subview, '42');
  });

  test('matches nested subviews', () => {
    const match = router.match('/notes/archive/2026');
    assert.ok(match);
    assert.equal(match.route.tag, 'b-notes-view');
    assert.equal(match.params.subview, 'archive/2026');
  });

  test('returns null when no route matches', () => {
    const match = router.match('/unregistered/path');
    assert.equal(match, null);
  });
});
