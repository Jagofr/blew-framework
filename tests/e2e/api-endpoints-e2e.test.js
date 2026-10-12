/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { features } from '../../src/routes.js';
import { extractActiveRoutes } from '../../src/core/router-utils.js';
import { BlewApiRouter } from '../../src/core/api-router.js';

describe('E2E Integration: Wildcard WinterCG Endpoints Pipeline', () => {
  const { apis } = extractActiveRoutes(features);
  const router = new BlewApiRouter(apis);

  describe('Counter Endpoint Pipeline (/api/counter/:action*)', () => {
    test('GET /api/counter returns current state', async () => {
      const req = new Request('http://localhost/api/counter');
      const res = await router.handle(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(typeof json.count, 'number');
    });

    test('POST /api/counter updates counter value', async () => {
      const req = new Request('http://localhost/api/counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 42 })
      });

      const res = await router.handle(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.count, 42);
    });

    test('POST /api/counter/reset invokes named RPC action', async () => {
      const req = new Request('http://localhost/api/counter/reset', {
        method: 'POST'
      });

      const res = await router.handle(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.count, 0);
    });
  });

  describe('Notes Endpoint Pipeline (/api/notes/:action*)', () => {
    let createdNoteId = '';

    test('GET /api/notes retrieves collection list', async () => {
      const req = new Request('http://localhost/api/notes');
      const res = await router.handle(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(json.total >= 1);
      assert.ok(Array.isArray(json.items));
    });

    test('POST /api/notes creates a new note record', async () => {
      const req = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'E2E Testing Note',
          content: 'Verified via WinterCG pipeline.'
        })
      });

      const res = await router.handle(req);
      assert.equal(res.status, 201);

      const json = await res.json();
      assert.ok(json.id);
      assert.equal(json.title, 'E2E Testing Note');
      createdNoteId = json.id;
    });

    test('GET /api/notes/:id retrieves specific note', async () => {
      const req = new Request(`http://localhost/api/notes/${createdNoteId}`);
      const res = await router.handle(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.id, createdNoteId);
      assert.equal(json.title, 'E2E Testing Note');
    });

    test('POST /api/notes/archive-note executes named RPC action', async () => {
      const req = new Request('http://localhost/api/notes/archive-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: createdNoteId })
      });

      const res = await router.handle(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.archived, createdNoteId);
    });

    test('GET /api/notes/export-all executes named RPC action returning attachment', async () => {
      const req = new Request('http://localhost/api/notes/export-all');
      const res = await router.handle(req);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('Content-Type'), 'application/json');
      assert.match(res.headers.get('Content-Disposition') || '', /attachment/);

      const json = await res.json();
      assert.ok(Array.isArray(json));
    });

    test('DELETE /api/notes/:id deletes record with 204 No Content', async () => {
      const req = new Request(`http://localhost/api/notes/${createdNoteId}`, {
        method: 'DELETE'
      });

      const res = await router.handle(req);
      assert.equal(res.status, 204);

      // Verify it no longer exists
      const verifyReq = new Request(`http://localhost/api/notes/${createdNoteId}`);
      const verifyRes = await router.handle(verifyReq);
      assert.equal(verifyRes.status, 404);
    });

    test('POST /api/notes with empty title returns 422 Unprocessable Entity', async () => {
      const req = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '   ' })
      });

      const res = await router.handle(req);
      assert.equal(res.status, 422);
    });
  });
});
