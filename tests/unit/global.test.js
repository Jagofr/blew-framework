/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Blew } from '../../src/core/global.js';

describe('Global Blew Runtime Helpers (`Blew.*`)', () => {
  test('exposes navigation shortcuts', () => {
    assert.equal(typeof Blew.navigate, 'function');
    assert.equal(typeof Blew.back, 'function');
    assert.equal(typeof Blew.forward, 'function');
  });

  test('exposes Web Badging API helpers', async () => {
    assert.ok(Blew.badge);
    assert.equal(typeof Blew.badge.set, 'function');
    assert.equal(typeof Blew.badge.clear, 'function');

    // Should not throw even if navigator.setAppBadge is not present in Node
    await assert.doesNotReject(async () => {
      await Blew.badge.set(5);
      await Blew.badge.clear();
    });
  });

  test('exposes Web Share API helper', async () => {
    assert.equal(typeof Blew.share, 'function');
    await assert.doesNotReject(async () => {
      await Blew.share({ title: 'Test', url: 'https://blew.jagofr.xyz' });
    });
  });

  test('exposes Top-Layer dialog helper', () => {
    assert.ok(Blew.dialog);
    assert.equal(typeof Blew.dialog.showModal, 'function');
    assert.equal(typeof Blew.dialog.close, 'function');

    // Safely handles non-existent elements
    assert.doesNotThrow(() => {
      Blew.dialog.showModal('#non-existent-modal');
      Blew.dialog.close('#non-existent-modal');
    });
  });

  test('exposes getThemeSheet() accessor', () => {
    assert.equal(typeof Blew.getThemeSheet, 'function');
  });
});

