/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Native top-layer dialog component (`<b-dialog>`).
 * Built upon the native HTML `<dialog>` and popover standard with focus management,
 * backdrop dimming, and light-dismissal capabilities.
 * @module @ui/b-dialog
 */

import { BlewElement } from '../core/element.js';

const dialogStyles = `
  :host {
    display: contents;
  }

  @scope (:host) {
    dialog.b-modal-native {
      border: 1px solid var(--b-color-border);
      border-radius: var(--b-radius-lg);
      background-color: var(--b-color-surface-elevated);
      color: var(--b-color-text);
      padding: var(--b-space-lg);
      max-width: 500px;
      width: calc(100% - 2rem);
      margin: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    dialog.b-modal-native::backdrop {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
    }

    header.dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--b-space-md);
    }

    h3.dialog-title {
      font-size: 1.15rem;
      margin: 0;
    }

    button.close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--b-color-text-muted);
      cursor: pointer;
      line-height: 1;
      padding: var(--b-space-xs);
    }

    section.dialog-body {
      margin-bottom: var(--b-space-lg);
    }

    footer.dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--b-space-sm);
    }
  }
`;

/**
 * `<b-dialog>` custom element wrapping HTML `<dialog>`.
 *
 * @extends {BlewElement}
 */
export class BlewDialog extends BlewElement {
  connectedCallback() {
    this.adoptStyles(dialogStyles);
    this.render();
  }

  /**
   * Promotes the dialog to the top layer.
   */
  showModal() {
    const dialog = this.shadowRoot.querySelector('dialog');
    if (dialog && typeof dialog.showModal === 'function' && !dialog.open) {
      dialog.showModal();
      this.dispatch('b-dialog-opened');
    }
  }

  /**
   * Closes the dialog.
   */
  close() {
    const dialog = this.shadowRoot.querySelector('dialog');
    if (dialog && typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
      this.dispatch('b-dialog-closed');
    }
  }

  render() {
    const title = this.getAttribute('title') || 'Dialog';

    const fragment = this.html`
      <dialog class="b-modal-native" id="native-dialog">
        <header class="dialog-header">
          <h3 class="dialog-title">${title}</h3>
          <button class="close-btn" id="close-x" aria-label="Close dialog">&times;</button>
        </header>
        <section class="dialog-body">
          <slot></slot>
        </section>
        <footer class="dialog-actions">
          <slot name="actions"></slot>
        </footer>
      </dialog>
    `;

    this.shadowRoot.replaceChildren(fragment);

    const dialog = this.shadowRoot.querySelector('#native-dialog');
    const closeBtn = this.shadowRoot.querySelector('#close-x');

    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }

    // Light-dismissal when clicking on the backdrop
    if (dialog) {
      dialog.onclick = (event) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          this.close();
        }
      };

      dialog.onclose = () => {
        this.dispatch('b-dialog-closed');
      };
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('b-dialog')) {
  customElements.define('b-dialog', BlewDialog);
}

