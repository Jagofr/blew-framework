/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ENV } from '../../src/core/env.js';

describe('Environment Detection Module (@blew/env)', () => {
  beforeEach(() => {
    delete globalThis.__APP_ENV__;
  });

  test('defaults to development mode when unconfigured', () => {
    assert.equal(ENV.mode, 'development');
    assert.equal(ENV.isDev(), true);
    assert.equal(ENV.isProd(), false);
  });

  test('respects globalThis.__APP_ENV__ === "production"', () => {
    globalThis.__APP_ENV__ = 'production';
    assert.equal(ENV.mode, 'production');
    assert.equal(ENV.isProd(), true);
    assert.equal(ENV.isDev(), false);
  });

  test('respects globalThis.__APP_ENV__ === "development"', () => {
    globalThis.__APP_ENV__ = 'development';
    assert.equal(ENV.mode, 'development');
    assert.equal(ENV.isDev(), true);
    assert.equal(ENV.isProd(), false);
  });
});

