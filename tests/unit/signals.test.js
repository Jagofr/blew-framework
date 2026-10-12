/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { signal, computed, effect, batch } from '../../src/core/signals.js';

describe('Reactivity Primitives (@blew/signals)', () => {
  describe('signal()', () => {
    test('initializes with given value', () => {
      const s = signal(10);
      assert.equal(s.value, 10);
    });

    test('updates value via setter', () => {
      const s = signal('initial');
      s.value = 'updated';
      assert.equal(s.value, 'updated');
    });

    test('updates value functionally via .update()', () => {
      const count = signal(5);
      const res = count.update((n) => n * 2);
      assert.equal(res, 10);
      assert.equal(count.value, 10);
    });

    test('notifies subscribers on mutation', () => {
      const count = signal(0);
      const history = [];

      const unsub = count.subscribe((val) => {
        history.push(val);
      });

      count.value = 1;
      count.value = 2;
      unsub();
      count.value = 3;

      assert.deepEqual(history, [1, 2]);
    });

    test('ignores assignment of identical primitive value', () => {
      const s = signal(42);
      let notifications = 0;
      s.subscribe(() => notifications++);

      s.value = 42;
      assert.equal(notifications, 0);
    });
  });

  describe('computed()', () => {
    test('derives value from upstream signals', () => {
      const first = signal('John');
      const last = signal('Doe');
      const full = computed(() => `${first.value} ${last.value}`);

      assert.equal(full.value, 'John Doe');
      first.value = 'Jane';
      assert.equal(full.value, 'Jane Doe');
    });

    test('lazily evaluates and caches computation until invalidation', () => {
      let evaluations = 0;
      const count = signal(1);
      const squared = computed(() => {
        evaluations++;
        return count.value ** 2;
      });

      assert.equal(evaluations, 0); // Not evaluated until read
      assert.equal(squared.value, 1);
      assert.equal(evaluations, 1);

      // Subsequent reads return cached result
      assert.equal(squared.value, 1);
      assert.equal(evaluations, 1);

      // Invalidation marks dirty, next read re-evaluates
      count.value = 3;
      assert.equal(squared.value, 9);
      assert.equal(evaluations, 2);
    });

    test('notifies subscribers when upstream dependency changes', () => {
      const count = signal(2);
      const doubled = computed(() => count.value * 2);
      const received = [];

      doubled.subscribe((val) => {
        received.push(val);
      });

      count.value = 4;
      assert.deepEqual(received, [8]);
    });
  });

  describe('effect()', () => {
    test('runs immediately on creation and tracks dependencies', () => {
      const count = signal(0);
      let captured = null;

      const stop = effect(() => {
        captured = count.value;
      });

      assert.equal(captured, 0);
      count.value = 5;
      assert.equal(captured, 5);

      stop();
      count.value = 10;
      assert.equal(captured, 5); // Did not update after disposal
    });

    test('executes returned cleanup function before next run and on teardown', () => {
      const trigger = signal(1);
      const logs = [];

      const stop = effect(() => {
        const val = trigger.value;
        logs.push(`run:${val}`);
        return () => {
          logs.push(`clean:${val}`);
        };
      });

      assert.deepEqual(logs, ['run:1']);

      trigger.value = 2;
      assert.deepEqual(logs, ['run:1', 'clean:1', 'run:2']);

      stop();
      assert.deepEqual(logs, ['run:1', 'clean:1', 'run:2', 'clean:2']);
    });
  });

  describe('batch()', () => {
    test('consolidates multiple notifications into a single pass', () => {
      const first = signal('A');
      const last = signal('B');
      let effectRuns = 0;

      effect(() => {
        // Read both
        first.value;
        last.value;
        effectRuns++;
      });

      assert.equal(effectRuns, 1);

      batch(() => {
        first.value = 'AA';
        last.value = 'BB';
      });

      // Downstream effect ran only once for both mutations
      assert.equal(effectRuns, 2);
      assert.equal(first.value, 'AA');
      assert.equal(last.value, 'BB');
    });

    test('supports nested batch calls cleanly', () => {
      const s = signal(0);
      let runs = 0;

      effect(() => {
        s.value;
        runs++;
      });

      assert.equal(runs, 1);

      batch(() => {
        s.value = 1;
        batch(() => {
          s.value = 2;
        });
        s.value = 3;
      });

      assert.equal(runs, 2);
      assert.equal(s.value, 3);
    });
  });
});
