/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Counter feature reactive micro-signals store.
 * @module @features/counter/store
 */

import { signal, computed } from '../../core/signals.js';

/**
 * Primary counter state signal.
 * @type {import('../../core/signals.js').Signal<number>}
 */
export const count = signal(0);

/**
 * Memoized derived double count computation.
 * @type {import('../../core/signals.js').Computed<number>}
 */
export const doubleCount = computed(() => count.value * 2);

/**
 * Increments the counter by one.
 * @returns {number} The updated count.
 */
export function increment() {
  return count.update((n) => n + 1);
}

/**
 * Decrements the counter by one (clamped to 0).
 * @returns {number} The updated count.
 */
export function decrement() {
  return count.update((n) => (n > 0 ? n - 1 : 0));
}

/**
 * Resets the counter value to zero.
 * @returns {void}
 */
export function reset() {
  count.value = 0;
}
