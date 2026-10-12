/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Notes feature reactive micro-signals store.
 * Manages notes collection, selection state, and atomic mutations.
 * @module @features/notes/store
 */

import { signal, computed } from '../../core/signals.js';

/**
 * @typedef {object} Note
 * @property {string} id - Unique identifier.
 * @property {string} title - Note heading title.
 * @property {string} content - Markdown/text content.
 * @property {boolean} [archived] - Whether note is archived.
 */

/**
 * Primary reactive notes list signal.
 * @type {import('../../core/signals.js').Signal<Note[]>}
 */
export const notes = signal([
  {
    id: 'note_1',
    title: 'Architecture Review',
    content: 'Native PWA built on Web Standards: Import Maps, Custom Elements, View Transitions.',
    archived: false
  },
  {
    id: 'note_2',
    title: 'Micro-Signals Benchmarking',
    content: 'Zero-VDOM reactivity achieves sub-millisecond updates and sub-1MB memory overhead.',
    archived: false
  }
]);

/**
 * Currently selected note ID.
 * @type {import('../../core/signals.js').Signal<string | null>}
 */
export const activeNoteId = signal('note_1');

/**
 * Derived computed signal returning the active note object.
 * @type {import('../../core/signals.js').Computed<Note | null>}
 */
export const selectedNote = computed(() => {
  const id = activeNoteId.value;
  if (!id) return null;
  return notes.value.find((n) => n.id === id) || null;
});

/**
 * Selects a note by its unique identifier.
 *
 * @param {string | null} id - The note identifier to activate.
 */
export function selectNote(id) {
  activeNoteId.value = id;
}

/**
 * Adds a new note to the collection and selects it.
 *
 * @param {string} title - Note title.
 * @param {string} [content=''] - Note content.
 * @returns {Note} Newly created note.
 */
export function addNote(title, content = '') {
  const newNote = {
    id: `note_${Date.now()}`,
    title: title.trim() || 'Untitled Note',
    content,
    archived: false
  };

  notes.update((current) => [newNote, ...current]);
  activeNoteId.value = newNote.id;
  return newNote;
}

/**
 * Deletes a note by its identifier.
 *
 * @param {string} id - Identifier of the note to remove.
 */
export function deleteNote(id) {
  notes.update((current) => current.filter((n) => n.id !== id));
  if (activeNoteId.value === id) {
    activeNoteId.value = notes.value[0]?.id || null;
  }
}

/**
 * Marks a note as archived.
 *
 * @param {string} id - Identifier of the note to archive.
 */
export function archiveNote(id) {
  notes.update((current) =>
    current.map((n) => (n.id === id ? { ...n, archived: true } : n))
  );
}
