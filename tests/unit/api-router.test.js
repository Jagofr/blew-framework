/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { BlewApiRouter, toCamelCase } from '../../src/core/api-router.js';

describe('Wildcard API Router (@blew/api)', () => {
  describe('toCamelCase() utility', () => {
    test('transforms kebab-case into camelCase', () => {
      assert.equal(toCamelCase('archive-note'), 'archiveNote');
      assert.equal(toCamelCase('export-all-data'), 'exportAllData');
      assert.equal(toCamelCase('single'), 'single');
      assert.equal(toCamelCase(''), '');
    });
  });

  describe('BlewApiRouter request dispatching', () => {
    const mockEndpoint = {
      GET: async (req, { params }) => {
        return Response.json({ action: 'GET_SUCCESS', params });
      },
      POST: async (req, { params }) => {
        const body = await req.json();
        return Response.json({ action: 'POST_SUCCESS', body }, { status: 201 });
      },
      archiveNote: async (req, { params }) => {
        return Response.json({ action: 'RPC_ARCHIVE_NOTE', params });
      }
    };

    const apiRoutes = [
      {
        feature: 'notes',
        pattern: '/api/notes/:action*',
        load: () => Promise.resolve(mockEndpoint)
      }
    ];

    const router = new BlewApiRouter(apiRoutes);

    test('dispatches to Named Action export over HTTP verb', async () => {
      const request = new Request('http://localhost/api/notes/archive-note', {
        method: 'POST'
      });

      const response = await router.handle(request);
      assert.equal(response.status, 200);

      const data = await response.json();
      assert.equal(data.action, 'RPC_ARCHIVE_NOTE');
      assert.equal(data.params.action, 'archive-note');
    });

    test('dispatches to HTTP verb export when no named action matches', async () => {
      const request = new Request('http://localhost/api/notes/my-note-123', {
        method: 'GET'
      });

      const response = await router.handle(request);
      assert.equal(response.status, 200);

      const data = await response.json();
      assert.equal(data.action, 'GET_SUCCESS');
      assert.equal(data.params.action, 'my-note-123');
    });

    test('passes request body and parameters cleanly to verb handlers', async () => {
      const request = new Request('http://localhost/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Testing' })
      });

      const response = await router.handle(request);
      assert.equal(response.status, 201);

      const data = await response.json();
      assert.equal(data.action, 'POST_SUCCESS');
      assert.equal(data.body.title, 'Testing');
    });

    test('returns 405 Method Not Allowed when method is unsupported', async () => {
      const request = new Request('http://localhost/api/notes', {
        method: 'DELETE'
      });

      const response = await router.handle(request);
      assert.equal(response.status, 405);
      const data = await response.json();
      assert.match(data.error, /Method Not Allowed/);
    });

    test('returns 404 Not Found for unregistered routes', async () => {
      const request = new Request('http://localhost/api/unknown-domain', {
        method: 'GET'
      });

      const response = await router.handle(request);
      assert.equal(response.status, 404);
      const data = await response.json();
      assert.match(data.error, /Not Found/);
    });

    test('returns 400 Bad Request if invalid request argument passed', async () => {
      const response = await router.handle(null);
      assert.equal(response.status, 400);
    });
  });
});

