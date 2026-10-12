/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Reusable application shell custom element (`<b-shell>`).
 * Provides responsive app header, navigation bar, drawer toggle, and slotted outlet layout.
 * @module @ui/b-shell
 */

import { BlewElement } from '../core/element.js';

const shellStyles = `
  :host {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  @scope (:host) {
    header.shell-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--b-space-md) var(--b-space-lg);
      background: var(--b-color-surface);
      border-bottom: 1px solid var(--b-color-border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: var(--b-space-sm);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--b-color-text);
      text-decoration: none;
    }

    nav.shell-nav {
      display: flex;
      gap: var(--b-space-md);
      align-items: center;
    }

    nav.shell-nav a {
      color: var(--b-color-text-muted);
      text-decoration: none;
      font-weight: 500;
      padding: var(--b-space-xs) var(--b-space-sm);
      border-radius: var(--b-radius-sm);
      transition: color var(--b-transition-fast), background-color var(--b-transition-fast);
    }

    nav.shell-nav a:hover,
    nav.shell-nav a.active {
      color: var(--b-color-primary);
      background-color: var(--b-color-surface-elevated);
    }

    main.shell-content {
      flex: 1;
      width: 100%;
      max-width: 1024px;
      margin: 0 auto;
      padding: var(--b-space-xl) var(--b-space-md);
    }

    footer.shell-footer {
      padding: var(--b-space-md) var(--b-space-lg);
      border-top: 1px solid var(--b-color-border);
      background: var(--b-color-surface);
      text-align: center;
      font-size: 0.85rem;
      color: var(--b-color-text-muted);
    }
  }
`;

/**
 * `<b-shell>` custom element providing consistent frame and layout.
 *
 * @extends {BlewElement}
 */
export class BlewShell extends BlewElement {
  connectedCallback() {
    this.adoptStyles(shellStyles);
    this.render();
  }

  /**
   * Renders the shell template with header, slot for active views, and footer.
   */
  render() {
    const title = this.getAttribute('app-title') || 'Blew Application 🍃';
    const fragment = this.html`
      <header class="shell-header">
        <a href="/" class="brand" b-link>
          <span>🍃</span>
          <strong>${title}</strong>
        </a>
        <nav class="shell-nav">
          <a href="/" b-link>Home</a>
          <a href="/counter" b-link>Counter</a>
          <a href="/notes" b-link>Notes</a>
        </nav>
      </header>

      <main class="shell-content">
        <slot></slot>
      </main>

      <footer class="shell-footer">
        <p>Built with standards-native Blew Framework &bull; Zero Build &bull; Zero Bloat</p>
      </footer>
    `;

    this.shadowRoot.replaceChildren(fragment);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('b-shell')) {
  customElements.define('b-shell', BlewShell);
}
