/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { BlewElement, StyleSheetCache } from '../../src/core/element.js';

describe('BlewElement & Styling Engine (@blew/core)', () => {
  describe('StyleSheetCache', () => {
    test('maintains in-memory stylesheet cache', () => {
      StyleSheetCache.clear();
      // In environment with CSSStyleSheet, returns instance or null
      const res = StyleSheetCache.getOrCreate(':host { color: red; }');
      if (typeof CSSStyleSheet !== 'undefined') {
        assert.ok(res instanceof CSSStyleSheet);
        const second = StyleSheetCache.getOrCreate(':host { color: red; }');
        assert.equal(res, second); // Deduped instance
      } else {
        assert.equal(res, null);
      }
    });
  });

  describe('BlewElement Lifecycle & Subscriptions', () => {
    test('instantiates with default properties and params record', () => {
      const el = new BlewElement();
      assert.deepEqual(el.params, {});
    });

    test('invokes registered disposers on disconnectedCallback()', () => {
      const el = new BlewElement();
      let disposedA = false;
      let disposedB = false;

      el.subscribe(() => {
        disposedA = true;
      });

      el.subscribe(() => {
        disposedB = true;
      });

      assert.equal(disposedA, false);
      assert.equal(disposedB, false);

      el.disconnectedCallback();

      assert.equal(disposedA, true);
      assert.equal(disposedB, true);
    });

    test('supports early manual disposal via returned callback', () => {
      const el = new BlewElement();
      let manualCalls = 0;

      const unsub = el.subscribe(() => {
        manualCalls++;
      });

      unsub();
      assert.equal(manualCalls, 1);

      // Subsequent disconnectedCallback should not invoke it again
      el.disconnectedCallback();
      assert.equal(manualCalls, 1);
    });

    test('safely handles non-function passed to subscribe()', () => {
      const el = new BlewElement();
      const unsub = el.subscribe(null);
      assert.doesNotThrow(() => unsub());
    });
  });
});

