/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Notes feature UI custom element (`<b-notes-view>`).
 * Implements a split master-detail view with live micro-signals bindings.
 * @module @features/notes/notes-view
 */

import { BlewElement } from '../../core/element.js';
import {
  notes,
  activeNoteId,
  selectedNote,
  selectNote,
  addNote,
  deleteNote,
  archiveNote
} from './store.js';

const viewStyles = `
  :host {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: var(--b-space-lg);
    min-height: 520px;
    view-transition-name: feature-notes;
  }

  @media (max-width: 768px) {
    :host {
      grid-template-columns: 1fr;
    }
  }

  @scope (:host) {
    aside.sidebar {
      border-right: 1px solid var(--b-color-border);
      padding-right: var(--b-space-md);
      display: flex;
      flex-direction: column;
      gap: var(--b-space-md);
    }

    button.new-btn {
      width: 100%;
      padding: 0.65rem 1rem;
      background: var(--b-color-primary);
      color: #ffffff;
      border: none;
      border-radius: var(--b-radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: background-color var(--b-transition-fast);
    }

    button.new-btn:hover {
      background: var(--b-color-primary-hover);
    }

    ul.note-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--b-space-xs);
      padding: 0;
      margin: 0;
      overflow-y: auto;
      max-height: 450px;
    }

    li.note-item {
      padding: var(--b-space-sm) var(--b-space-md);
      border-radius: var(--b-radius-md);
      cursor: pointer;
      background: var(--b-color-surface);
      border: 1px solid transparent;
      transition: border-color var(--b-transition-fast), background-color var(--b-transition-fast);
    }

    li.note-item:hover {
      background: var(--b-color-surface-elevated);
    }

    li.note-item.active {
      border-color: var(--b-color-primary);
      background: var(--b-color-surface-elevated);
    }

    li.note-item.archived {
      opacity: 0.6;
      text-decoration: line-through;
    }

    main.note-detail {
      padding: var(--b-space-md);
      background: var(--b-color-surface-elevated);
      border: 1px solid var(--b-color-border);
      border-radius: var(--b-radius-md);
      display: flex;
      flex-direction: column;
      gap: var(--b-space-md);
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--b-color-border);
      padding-bottom: var(--b-space-sm);
    }

    .detail-actions {
      display: flex;
      gap: var(--b-space-xs);
    }

    .btn-danger {
      background: var(--b-color-danger);
      color: #ffffff;
      border: none;
      border-radius: var(--b-radius-sm);
      padding: 0.35rem 0.75rem;
      cursor: pointer;
    }

    .btn-secondary {
      background: var(--b-color-surface);
      color: var(--b-color-text);
      border: 1px solid var(--b-color-border);
      border-radius: var(--b-radius-sm);
      padding: 0.35rem 0.75rem;
      cursor: pointer;
    }

    .note-content-body {
      white-space: pre-wrap;
      line-height: 1.6;
      color: var(--b-color-text);
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--b-color-text-muted);
      font-style: italic;
    }
  }
`;

/**
 * `<b-notes-view>` custom element.
 * @extends {BlewElement}
 */
export class NotesView extends BlewElement {
  connectedCallback() {
    this.adoptStyles(viewStyles);
    this.render();

    // Re-render list whenever notes signal mutates
    const unsubNotes = notes.subscribe(() => {
      this.updateList();
      this.updateDetail();
    });

    // Re-render detail whenever active note changes
    const unsubActive = activeNoteId.subscribe(() => {
      this.updateList();
      this.updateDetail();
    });

    this.subscribe(unsubNotes);
    this.subscribe(unsubActive);
  }

  /**
   * Updates the sidebar note items without replacing the entire DOM tree.
   */
  updateList() {
    const listEl = this.shadowRoot.querySelector('#note-items');
    if (!listEl) return;

    listEl.innerHTML = '';
    for (const n of notes.value) {
      const li = document.createElement('li');
      li.className = `note-item ${n.id === activeNoteId.value ? 'active' : ''} ${n.archived ? 'archived' : ''}`;
      li.dataset.id = n.id;
      li.textContent = n.title;
      listEl.appendChild(li);
    }
  }

  /**
   * Updates the detail panel content based on selected note.
   */
  updateDetail() {
    const detailEl = this.shadowRoot.querySelector('#note-detail');
    if (!detailEl) return;

    const note = selectedNote.value;
    if (!note) {
      detailEl.innerHTML = '<div class="empty-state"><p>Select or create a note to view details.</p></div>';
      return;
    }

    detailEl.innerHTML = `
      <div class="detail-header">
        <h2>${note.title}</h2>
        <div class="detail-actions">
          <button id="btn-archive" class="btn-secondary" type="button">
            ${note.archived ? 'Archived' : 'Archive'}
          </button>
          <button id="btn-delete" class="btn-danger" type="button">Delete</button>
        </div>
      </div>
      <div class="note-content-body">${note.content}</div>
    `;

    const btnArchive = detailEl.querySelector('#btn-archive');
    const btnDelete = detailEl.querySelector('#btn-delete');

    if (btnArchive && !note.archived) {
      btnArchive.onclick = () => archiveNote(note.id);
    }
    if (btnDelete) {
      btnDelete.onclick = () => deleteNote(note.id);
    }
  }

  render() {
    const fragment = this.html`
      <aside class="sidebar">
        <button class="new-btn" id="create-btn" type="button">+ Create Note</button>
        <ul class="note-list" id="note-items"></ul>
      </aside>

      <main class="note-detail" id="note-detail"></main>
    `;

    this.shadowRoot.replaceChildren(fragment);
    this.updateList();
    this.updateDetail();

    const createBtn = this.shadowRoot.querySelector('#create-btn');
    if (createBtn) {
      createBtn.onclick = () => {
        const title = prompt('Enter note title:') || 'Untitled Note';
        const content = prompt('Enter note content:') || '';
        addNote(title, content);
      };
    }

    const listEl = this.shadowRoot.querySelector('#note-items');
    if (listEl) {
      listEl.onclick = (event) => {
        const target = event.target;
        if (target instanceof Element) {
          const item = target.closest('.note-item');
          if (item && item.dataset.id) {
            selectNote(item.dataset.id);
          }
        }
      };
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('b-notes-view')) {
  customElements.define('b-notes-view', NotesView);
}

