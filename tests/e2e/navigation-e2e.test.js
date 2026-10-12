/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { features } from '../../src/routes.js';
import { extractActiveRoutes } from '../../src/core/router-utils.js';
import { BlewRouter } from '../../src/core/router.js';

describe('E2E Integration: Client Navigation & Route Matching', () => {
  const { views } = extractActiveRoutes(features);
  const router = new BlewRouter(views, null, {
    fallbackTag: 'b-home-view',
    enableTransitions: false
  });

  test('resolves and loads landing screen view route (/)', async () => {
    const match = router.match('/');
    assert.ok(match);
    assert.equal(match.route.tag, 'b-home-view');

    const mod = await match.route.load();
    assert.ok(mod);
    assert.ok(mod.HomeView);
  });

  test('resolves and loads counter view route (/counter)', async () => {
    const match = router.match('/counter');
    assert.ok(match);
    assert.equal(match.route.tag, 'b-counter-view');

    const mod = await match.route.load();
    assert.ok(mod);
    assert.ok(mod.CounterView);
  });

  test('resolves and loads notes view route with parameters (/notes/note_1)', async () => {
    const match = router.match('/notes/note_1');
    assert.ok(match);
    assert.equal(match.route.tag, 'b-notes-view');
    assert.equal(match.params.subview, 'note_1');

    const mod = await match.route.load();
    assert.ok(mod);
    assert.ok(mod.NotesView);
  });

  test('returns null for unmapped paths', () => {
    const match = router.match('/unknown-feature');
    assert.equal(match, null);
  });
});

