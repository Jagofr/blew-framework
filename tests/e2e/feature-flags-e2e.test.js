/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { features } from '../../src/routes.js';
import { extractActiveRoutes } from '../../src/core/router-utils.js';
import { BlewRouter } from '../../src/core/router.js';
import { BlewApiRouter } from '../../src/core/api-router.js';

describe('E2E Integration: Atomic Feature Flags & Route Pruning', () => {
  test('disables feature slices with a single `disabled: true` flag in routes.js', async () => {
    // ai-summary is marked disabled: true in src/routes.js
    const aiFeature = features.find((f) => f.name === 'ai-summary');
    assert.ok(aiFeature);
    assert.equal(aiFeature.disabled, true);

    const { views, apis } = extractActiveRoutes(features);

    // Verify view is stripped
    const aiView = views.find((v) => v.tag === 'b-ai-view');
    assert.equal(aiView, undefined);

    // Verify api is stripped
    const aiApi = apis.find((a) => a.pattern === '/api/ai/:action*');
    assert.equal(aiApi, undefined);

    // Verify router does not match disabled view
    const router = new BlewRouter(views, null);
    const viewMatch = router.match('/ai/summarize');
    assert.equal(viewMatch, null);

    // Verify API router returns 404 for disabled endpoint
    const apiRouter = new BlewApiRouter(apis);
    const apiRes = await apiRouter.handle(new Request('http://localhost/api/ai/summarize'));
    assert.equal(apiRes.status, 404);
  });
});
