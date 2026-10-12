/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview High-performance, fine-grained micro-signals reactivity engine.
 * Aligned with the TC39 Signals proposal. Provides fine-grained dependency tracking,
 * lazy memoized computations, side-effect scheduling, and microtask batching.
 * @module @blew/signals
 */

/**
 * @template T
 * @callback Subscriber
 * @param {T} value - The new value emitted by the signal.
 * @returns {void}
 */

/**
 * @callback Disposer
 * @returns {void}
 */

/**
 * @callback EffectFn
 * @returns {void | Disposer}
 */

/**
 * Active dependency tracking context stack.
 * @type {Array<ComputationSubscriber>}
 */
const trackingStack = [];

/**
 * Batch transaction depth counter.
 * @type {number}
 */
let batchDepth = 0;

/**
 * Map of pending subscriber notifications to flush after the outermost batch completes.
 * Keyed by subscriber reference to deduplicate identical subscribers across multiple signal mutations.
 * @type {Map<Function, () => void>}
 */
const pendingBatchSubscribers = new Map();

/**
 * @interface ComputationSubscriber
 * @property {() => void} notify
 * @property {Set<SignalInternal<any>>} dependencies
 */

/**
 * Base signal interface representing a reactive value source.
 * @template T
 */
export class SignalInternal {
  /**
   * Internal constructor for reactive primitives.
   * @param {T} initialValue
   */
  constructor(initialValue) {
    /**
     * @protected
     * @type {T}
     */
    this._value = initialValue;

    /**
     * Subscriptions registered via .subscribe() or dynamic effects.
     * @protected
     * @type {Set<Subscriber<T>>}
     */
    this._subscribers = new Set();
  }

  /**
   * Reads current value while registering active dependency if tracking.
   * @returns {T}
   */
  get value() {
    const active = trackingStack[trackingStack.length - 1];
    if (active) {
      this._subscribers.add(active.notify);
      active.dependencies.add(this);
    }
    return this._value;
  }

  /**
   * Subscribes to value changes.
   * Immediately registers the callback to receive future notifications.
   *
   * @param {Subscriber<T>} fn - Listener invoked when the value changes.
   * @returns {Disposer} Function to remove the subscription.
   */
  subscribe(fn) {
    this._subscribers.add(fn);
    return () => {
      this._subscribers.delete(fn);
    };
  }

  /**
   * Unsubscribes a listener function.
   * @param {Subscriber<T>} fn
   */
  unsubscribe(fn) {
    this._subscribers.delete(fn);
  }

  /**
   * Dispatches notifications to all subscribers, honoring the batching queue.
   * @protected
   */
  _notify() {
    const currentSubscribers = Array.from(this._subscribers);
    for (const sub of currentSubscribers) {
      if (batchDepth > 0) {
        pendingBatchSubscribers.set(sub, () => sub(this._value));
      } else {
        sub(this._value);
      }
    }
  }
}

/**
 * Mutable reactive state container.
 * @template T
 * @extends {SignalInternal<T>}
 */
export class Signal extends SignalInternal {
  /**
   * Creates a new mutable signal.
   * @param {T} initialValue
   */
  constructor(initialValue) {
    super(initialValue);
  }

  /**
   * Sets a new value. If the value differs from current (using Object.is),
   * subscribers are notified.
   * @param {T} nextValue
   */
  set value(nextValue) {
    if (!Object.is(this._value, nextValue)) {
      this._value = nextValue;
      this._notify();
    }
  }

  /**
   * Reads the current value and registers dependencies.
   * @returns {T}
   */
  get value() {
    return super.value;
  }

  /**
   * Applies a functional updater to the current value.
   *
   * @param {(current: T) => T} updater - Function taking the current value and returning the next.
   * @returns {T} The newly calculated value.
   * @example
   * ```javascript
   * counter.update((n) => n + 1);
   * ```
   */
  update(updater) {
    const next = updater(this._value);
    this.value = next;
    return this._value;
  }
}

/**
 * Lazy memoized reactive computation derived from upstream signals.
 * @template T
 * @extends {SignalInternal<T>}
 */
export class Computed extends SignalInternal {
  /**
   * Creates a computed signal.
   * @param {() => T} computeFn - The pure derivation function.
   */
  constructor(computeFn) {
    super(/** @type {T} */ (undefined));
    /**
     * @private
     * @type {() => T}
     */
    this._computeFn = computeFn;

    /**
     * @private
     * @type {boolean}
     */
    this._dirty = true;

    /**
     * @private
     * @type {Set<SignalInternal<any>>}
     */
    this._dependencies = new Set();

    /**
     * Internal notification handler when an upstream dependency changes.
     * @private
     */
    this._onDependencyChange = () => {
      if (!this._dirty) {
        this._dirty = true;
        const oldValue = this._value;
        this._recompute();
        if (!Object.is(oldValue, this._value)) {
          this._notify();
        }
      }
    };
  }

  /**
   * Subscribes to computed value changes.
   * Ensures initial evaluation and dependency attachment occurs immediately.
   *
   * @param {Subscriber<T>} fn - Listener invoked when the value changes.
   * @returns {Disposer} Function to remove the subscription.
   */
  subscribe(fn) {
    if (this._dirty) {
      this._recompute();
    }
    return super.subscribe(fn);
  }

  /**
   * Re-evaluates the derivation function while capturing upstream dependencies.
   * @private
   */
  _recompute() {
    // Unbind from old dependencies
    for (const dep of this._dependencies) {
      dep.unsubscribe(this._onDependencyChange);
    }
    this._dependencies.clear();

    const trackingContext = {
      notify: this._onDependencyChange,
      dependencies: this._dependencies
    };

    trackingStack.push(trackingContext);
    try {
      this._value = this._computeFn();
      this._dirty = false;
    } finally {
      trackingStack.pop();
    }

    // Attach listener to newly discovered dependencies
    for (const dep of this._dependencies) {
      dep.subscribe(this._onDependencyChange);
    }
  }

  /**
   * Reads the computed value. Re-evaluates lazily if upstream dependencies changed.
   * @returns {T}
   */
  get value() {
    if (this._dirty) {
      this._recompute();
    }
    return super.value;
  }
}

/**
 * Creates a reactive state container with getter and setter access.
 *
 * @template T
 * @param {T} initialValue - The initial value for the signal.
 * @returns {Signal<T>} A reactive mutable signal instance.
 * @example
 * ```javascript
 * import { signal } from '@blew/signals';
 *
 * export const counter = signal(0);
 * counter.value = 1;
 * counter.update(n => n + 1);
 * ```
 */
export function signal(initialValue) {
  return new Signal(initialValue);
}

/**
 * Creates a memoized, read-only signal derived from one or more upstream signals.
 * Evaluates lazily and caches the result until an upstream dependency mutates.
 *
 * @template T
 * @param {() => T} fn - Function computing the derived value.
 * @returns {Computed<T>} A memoized read-only computed signal.
 * @example
 * ```javascript
 * import { signal, computed } from '@blew/signals';
 *
 * const first = signal('Jane');
 * const last = signal('Doe');
 * const full = computed(() => `${first.value} ${last.value}`);
 * ```
 */
export function computed(fn) {
  return new Computed(fn);
}

/**
 * Executes a side-effect function immediately and tracks all reactive signals read.
 * Automatically re-executes whenever any tracked dependency mutates.
 * Returns a disposal function to tear down the effect.
 *
 * @param {EffectFn} fn - Side-effect function to execute. May return a cleanup disposer.
 * @returns {Disposer} Function that halts execution and cleans up dependencies.
 * @example
 * ```javascript
 * import { signal, effect } from '@blew/signals';
 *
 * const count = signal(0);
 * const dispose = effect(() => {
 *   document.title = `Count: ${count.value}`;
 *   return () => console.log('Cleaning up previous effect run');
 * });
 * // Later: dispose();
 * ```
 */
export function effect(fn) {
  /** @type {Disposer | void} */
  let cleanup;
  /** @type {boolean} */
  let active = true;
  /** @type {Set<SignalInternal<any>>} */
  const dependencies = new Set();

  function run() {
    if (!active) return;

    if (typeof cleanup === 'function') {
      try {
        cleanup();
      } catch (err) {
        console.error('Error during effect cleanup:', err);
      }
      cleanup = undefined;
    }

    // Unsubscribe from previous dependencies
    for (const dep of dependencies) {
      dep.unsubscribe(scheduledRun);
    }
    dependencies.clear();

    const trackingContext = {
      notify: scheduledRun,
      dependencies
    };

    trackingStack.push(trackingContext);
    try {
      const res = fn();
      if (typeof res === 'function') {
        cleanup = res;
      }
    } finally {
      trackingStack.pop();
    }

    // Subscribe to newly discovered dependencies
    for (const dep of dependencies) {
      dep.subscribe(scheduledRun);
    }
  }

  function scheduledRun() {
    if (!active) return;
    run();
  }

  // Initial execution
  run();

  return () => {
    if (!active) return;
    active = false;
    if (typeof cleanup === 'function') {
      try {
        cleanup();
      } catch (err) {
        console.error('Error during effect teardown:', err);
      }
    }
    for (const dep of dependencies) {
      dep.unsubscribe(scheduledRun);
    }
    dependencies.clear();
  };
}

/**
 * Defers change notifications across multiple signal writes, consolidating downstream
 * computed values and effects into a single execution pass.
 *
 * @param {() => void} fn - Block within which multiple signal mutations are performed.
 * @returns {void}
 * @example
 * ```javascript
 * import { signal, batch } from '@blew/signals';
 *
 * const a = signal(1);
 * const b = signal(2);
 *
 * batch(() => {
 *   a.value = 10;
 *   b.value = 20;
 * }); // Observers are notified once here
 * ```
 */
export function batch(fn) {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      const toFlush = Array.from(pendingBatchSubscribers.values());
      pendingBatchSubscribers.clear();
      for (const flush of toFlush) {
        try {
          flush();
        } catch (err) {
          console.error('Error during batch flush:', err);
        }
      }
    }
  }
}
