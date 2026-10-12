/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Universal WinterCG endpoint for the notes feature slice.
 * Supports standard REST verbs (GET, POST, DELETE) alongside named RPC action exports
 * (archiveNote, exportAll).
 * @module @features/notes/endpoint
 */

/**
 * In-memory data store for development and offline service worker execution.
 * @type {Map<string, { id: string, title: string, content: string, archived?: boolean }>}
 */
export const storage = new Map([
  [
    'note_1',
    {
      id: 'note_1',
      title: 'Architecture Review',
      content: 'Native PWA built on Web Standards: Import Maps, Custom Elements, View Transitions.',
      archived: false
    }
  ],
  [
    'note_2',
    {
      id: 'note_2',
      title: 'Micro-Signals Benchmarking',
      content: 'Zero-VDOM reactivity achieves sub-millisecond updates and sub-1MB memory overhead.',
      archived: false
    }
  ]
]);

/**
 * GET /api/notes
 * GET /api/notes/:id
 *
 * @param {Request} request - Incoming fetch Request.
 * @param {import('../../core/api-router.js').ApiContext} context - Route context.
 * @returns {Promise<Response>} JSON response with note(s).
 */
export async function GET(request, { params }) {
  if (params?.action) {
    const item = storage.get(params.action);
    if (!item) {
      return Response.json({ error: 'Note not found' }, { status: 404 });
    }
    return Response.json(item);
  }

  const all = Array.from(storage.values());
  return Response.json({ total: all.length, items: all });
}

/**
 * POST /api/notes
 * Creates a new note record.
 *
 * @param {Request} request - Incoming fetch Request with JSON body.
 * @returns {Promise<Response>} JSON response with created note (status 201).
 */
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data?.title?.trim()) {
      return Response.json({ error: 'Title is required' }, { status: 422 });
    }

    const id = data.id || `note_${Date.now()}`;
    const newNote = {
      id,
      title: data.title.trim(),
      content: data.content || '',
      archived: Boolean(data.archived)
    };

    storage.set(id, newNote);
    return Response.json(newNote, { status: 201 });
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}

/**
 * DELETE /api/notes/:id
 * Deletes a note by its identifier.
 *
 * @param {Request} request - Incoming fetch Request.
 * @param {import('../../core/api-router.js').ApiContext} context - Route context.
 * @returns {Promise<Response>} 204 No Content on success, or 404 if not found.
 */
export async function DELETE(request, { params }) {
  const id = params?.action;
  if (!id || !storage.has(id)) {
    return Response.json({ error: 'Note not found' }, { status: 404 });
  }

  storage.delete(id);
  return new Response(null, { status: 204 });
}

/**
 * Named RPC Action: POST /api/notes/archive-note (or /api/notes/archive)
 *
 * @param {Request} request - Incoming fetch Request with JSON body { id: string }.
 * @returns {Promise<Response>} JSON response confirming archiving.
 */
export async function archiveNote(request) {
  try {
    const { id } = await request.json();
    const note = storage.get(id);

    if (!note) {
      return Response.json({ error: 'Note not found' }, { status: 404 });
    }

    note.archived = true;
    storage.set(id, note);

    return Response.json({ success: true, archived: id });
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}

/**
 * Named RPC Action: GET /api/notes/export-all
 *
 * @param {Request} request - Incoming fetch Request.
 * @returns {Promise<Response>} Downloadable JSON file response.
 */
export async function exportAll(request) {
  const all = Array.from(storage.values());
  return new Response(JSON.stringify(all, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="notes.json"'
    }
  });
}
