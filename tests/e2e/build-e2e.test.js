/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build } from '../../build.js';

describe('E2E Integration: Headless Production Bundler (build.js)', () => {
  test('executes production build and verifies distribution invariants', async () => {
    const result = await build();

    assert.ok(result);
    assert.ok(result.totalCoreBrotliBytes > 0);

    // Architectural target budget check: core runtime < 5 kB brotli
    assert.ok(
      result.totalCoreBrotliBytes < 5 * 1024,
      `Core runtime (${(result.totalCoreBrotliBytes / 1024).toFixed(2)} kB) exceeds 5 kB brotli target`
    );

    // Verify output files exist in dist/
    const distDir = path.join(process.cwd(), 'dist');
    assert.ok(fs.existsSync(distDir));
    assert.ok(fs.existsSync(path.join(distDir, 'index.html')));
    assert.ok(fs.existsSync(path.join(distDir, 'manifest.webmanifest')));
    assert.ok(fs.existsSync(path.join(distDir, 'sw.js')));
    assert.ok(fs.existsSync(path.join(distDir, 'chunks')));

    // Verify injected production import map
    const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
    assert.match(html, /<script type="importmap">/);
    assert.match(html, /"@blew\/core"/);
    assert.match(html, /"@blew\/signals"/);
    assert.match(html, /"@blew\/router"/);
    assert.match(html, /"@blew\/api"/);

    // Verify disabled features were pruned
    assert.equal(fs.existsSync(path.join(distDir, 'chunks', 'features', 'ai-summary')), false);
  });
});
