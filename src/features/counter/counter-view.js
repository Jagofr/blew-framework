/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Counter feature UI custom element (`<b-counter-view>`).
 * Connects micro-signals reactive store to encapsulated Shadow DOM.
 * @module @features/counter/counter-view
 */

import { BlewElement } from '../../core/element.js';
import { count, doubleCount, increment, decrement, reset } from './store.js';

const counterStyles = `
  :host {
    display: block;
    padding: var(--b-space-lg);
    background: var(--b-color-surface-elevated);
    border: 1px solid var(--b-color-border);
    border-radius: var(--b-radius-md);
    view-transition-name: counter-card;
  }

  @scope (:host) {
    h2 {
      margin-bottom: var(--b-space-sm);
      font-size: 1.5rem;
    }

    p.lead {
      color: var(--b-color-text-muted);
      margin-bottom: var(--b-space-md);
    }

    .metrics {
      display: flex;
      gap: var(--b-space-lg);
      margin: var(--b-space-md) 0;
      padding: var(--b-space-md);
      background: var(--b-color-surface);
      border: 1px solid var(--b-color-border);
      border-radius: var(--b-radius-sm);
    }

    .metric-item {
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--b-color-text-muted);
    }

    .metric-value {
      font-family: var(--b-font-mono);
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--b-color-text);
    }

    .button-group {
      display: flex;
      gap: var(--b-space-sm);
      margin-top: var(--b-space-md);
    }

    button {
      padding: 0.5rem 1rem;
      background: var(--b-color-primary);
      color: #ffffff;
      border: none;
      border-radius: var(--b-radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: background-color var(--b-transition-fast);
    }

    button:hover {
      background: var(--b-color-primary-hover);
    }

    button.secondary {
      background: var(--b-color-surface);
      color: var(--b-color-text);
      border: 1px solid var(--b-color-border);
    }

    button.secondary:hover {
      background: var(--b-color-surface-sunken);
    }
  }
`;

/**
 * `<b-counter-view>` custom element.
 * @extends {BlewElement}
 */
export class CounterView extends BlewElement {
  connectedCallback() {
    this.adoptStyles(counterStyles);
    this.render();

    // Auto-update DOM nodes on reactive signal mutation
    const unsubscribe = count.subscribe((val) => {
      const valEl = this.shadowRoot.querySelector('#val');
      const dblEl = this.shadowRoot.querySelector('#dbl');
      if (valEl) valEl.textContent = String(val);
      if (dblEl) dblEl.textContent = String(doubleCount.value);
    });

    // Automatically unsubscribes on element disconnect
    this.subscribe(unsubscribe);
  }

  render() {
    const fragment = this.html`
      <section>
        <h2>Interactive Micro-Signals Counter</h2>
        <p class="lead">Fine-grained TC39 reactivity without Virtual DOM or diffing.</p>

        <div class="metrics">
          <div class="metric-item">
            <span class="metric-label">Count</span>
            <span class="metric-value" id="val">${count.value}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Doubled</span>
            <span class="metric-value" id="dbl">${doubleCount.value}</span>
          </div>
        </div>

        <div class="button-group">
          <button id="inc-btn" type="button">+ Increment</button>
          <button id="dec-btn" class="secondary" type="button">- Decrement</button>
          <button id="rst-btn" class="secondary" type="button">Reset</button>
        </div>
      </section>
    `;

    this.shadowRoot.replaceChildren(fragment);

    const incBtn = this.shadowRoot.querySelector('#inc-btn');
    const decBtn = this.shadowRoot.querySelector('#dec-btn');
    const rstBtn = this.shadowRoot.querySelector('#rst-btn');

    if (incBtn) incBtn.onclick = () => increment();
    if (decBtn) decBtn.onclick = () => decrement();
    if (rstBtn) rstBtn.onclick = () => reset();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('b-counter-view')) {
  customElements.define('b-counter-view', CounterView);
}

