/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Universal WinterCG endpoint for the counter feature slice.
 * Adheres to Request -> Response specification for identical execution in
 * Service Workers (offline mode) and backend servers.
 * @module @features/counter/endpoint
 */

import { count, reset as resetStore } from './store.js';

/**
 * GET /api/counter
 * Returns the current reactive counter value.
 *
 * @param {Request} request - Incoming fetch Request.
 * @param {import('../../core/api-router.js').ApiContext} context - Route context.
 * @returns {Promise<Response>} JSON response with current count.
 */
export async function GET(request, context) {
  return Response.json({ count: count.value });
}

/**
 * POST /api/counter
 * Updates the reactive counter value from request body.
 *
 * @param {Request} request - Incoming fetch Request with JSON body { value: number }.
 * @param {import('../../core/api-router.js').ApiContext} context - Route context.
 * @returns {Promise<Response>} JSON response with updated count.
 */
export async function POST(request, context) {
  try {
    const data = await request.json();
    if (typeof data?.value === 'number') {
      count.value = data.value;
    }
    return Response.json({ success: true, count: count.value });
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}

/**
 * Named RPC Action: POST /api/counter/reset
 * Resets the reactive counter value back to zero.
 *
 * @param {Request} request - Incoming fetch Request.
 * @param {import('../../core/api-router.js').ApiContext} context - Route context.
 * @returns {Promise<Response>} JSON response confirming reset.
 */
export async function reset(request, context) {
  resetStore();
  return Response.json({ success: true, count: 0 });
}
