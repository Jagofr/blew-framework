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

    // Verify GitHub Pages subpath compatibility assets
    assert.ok(fs.existsSync(path.join(distDir, '.nojekyll')));
    assert.ok(fs.existsSync(path.join(distDir, '404.html')));

    // Verify relative paths in index.html for subpath hosting
    assert.match(html, /href="\.\/manifest\.webmanifest"/);
    assert.match(html, /href="\.\/theme\.[a-f0-9]+\.css"/);
    assert.match(html, /src="\.\/app\.[a-f0-9]+\.js"/);
    assert.match(html, /"@blew\/core": "\.\/chunks\/element\.[a-f0-9]+\.js"/);

    // Verify manifest has relative scope/start_url
    const manifest = JSON.parse(fs.readFileSync(path.join(distDir, 'manifest.webmanifest'), 'utf8'));
    assert.equal(manifest.start_url, './');
    assert.equal(manifest.scope, './');

    // Verify disabled features were pruned
    assert.equal(fs.existsSync(path.join(distDir, 'chunks', 'features', 'ai-summary')), false);
  });
});

