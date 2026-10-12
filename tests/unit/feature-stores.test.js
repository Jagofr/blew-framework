/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  count,
  doubleCount,
  increment,
  decrement,
  reset as resetCounter
} from '../../src/features/counter/store.js';

import {
  notes,
  activeNoteId,
  selectedNote,
  addNote,
  selectNote,
  deleteNote,
  archiveNote
} from '../../src/features/notes/store.js';

describe('Feature Slices Reactive Stores', () => {
  describe('Counter Feature Store', () => {
    test('initializes and computes doubled values', () => {
      resetCounter();
      assert.equal(count.value, 0);
      assert.equal(doubleCount.value, 0);

      increment();
      assert.equal(count.value, 1);
      assert.equal(doubleCount.value, 2);

      increment();
      assert.equal(count.value, 2);
      assert.equal(doubleCount.value, 4);

      decrement();
      assert.equal(count.value, 1);
      assert.equal(doubleCount.value, 2);

      resetCounter();
      assert.equal(count.value, 0);
      assert.equal(doubleCount.value, 0);
    });

    test('clamps decrement to 0', () => {
      resetCounter();
      decrement();
      assert.equal(count.value, 0);
    });
  });

  describe('Notes Feature Store', () => {
    test('manages note collection, selection and computed active note', () => {
      const initialCount = notes.value.length;
      assert.ok(initialCount >= 1);

      // Select first note
      selectNote('note_1');
      assert.equal(activeNoteId.value, 'note_1');
      assert.equal(selectedNote.value?.id, 'note_1');

      // Add note
      const created = addNote('New Feature Plan', 'Implement unit tests.');
      assert.equal(notes.value.length, initialCount + 1);
      assert.equal(activeNoteId.value, created.id);
      assert.equal(selectedNote.value?.title, 'New Feature Plan');

      // Archive note
      archiveNote(created.id);
      assert.equal(selectedNote.value?.archived, true);

      // Delete note
      deleteNote(created.id);
      assert.equal(notes.value.length, initialCount);
      assert.notEqual(activeNoteId.value, created.id);
    });
  });
});

