/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { VERSION, CACHE_NAME } from '../../sw.js';

describe('E2E Integration: Progressive Web App Service Worker', () => {
  test('strictly adheres to semantic versioning format in Service Worker', () => {
    // Format: MAJOR.MINOR.PATCH BUILD-TYPE (BUILD 0000)
    assert.match(VERSION, /^\d+\.\d+\.\d+ [A-Z]+ \(BUILD \d{4}\)$/);
    assert.match(CACHE_NAME, /^blew-cache-\d+\.\d+\.\d+-[a-z]+\.build-\d{4}$/);
  });

  test('verifies all precached files exist on the filesystem', () => {
    const swContent = fs.readFileSync(path.join(process.cwd(), 'sw.js'), 'utf8');
    const match = swContent.match(/PRECACHE_ASSETS\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(match, 'PRECACHE_ASSETS should be declared');

    const assetPaths = match[1]
      .split(',')
      .map((s) => s.trim().replace(/['"]/g, ''))
      .filter((s) => s.length > 0 && s !== '/');

    for (const relativePath of assetPaths) {
      const normalizedPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
      const fullPath = path.join(process.cwd(), normalizedPath);
      assert.ok(
        fs.existsSync(fullPath),
        `Precached asset should exist on disk: ${normalizedPath}`
      );
    }
  });

  test('PWA manifest declares matching version string', () => {
    const manifestRaw = fs.readFileSync(path.join(process.cwd(), 'manifest.webmanifest'), 'utf8');
    const manifest = JSON.parse(manifestRaw);
    assert.equal(manifest.version, VERSION);
  });
});

