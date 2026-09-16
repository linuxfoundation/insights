// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { versionRegistry } from '../src/versions/registry.js';

const apiRoot = fileURLToPath(new URL('..', import.meta.url));

describe('version registry (AC1, AC4)', () => {
  it('exports a non-empty ordered list of version entries', () => {
    expect(Array.isArray(versionRegistry)).toBe(true);
    expect(versionRegistry.length).toBeGreaterThan(0);
  });

  it('each entry has a URL prefix and a plugin', () => {
    for (const entry of versionRegistry) {
      expect(entry.prefix).toMatch(/^\/v\d+(-[a-z]+)?$/);
      expect(typeof entry.plugin).toBe('function');
    }
  });

  it('prefixes are unique', () => {
    const prefixes = versionRegistry.map((entry) => entry.prefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it('ships with v1', () => {
    expect(versionRegistry.map((entry) => entry.prefix)).toContain('/v1');
  });
});

describe('app wiring (AC1, AC4)', () => {
  const appSource = readFileSync(`${apiRoot}src/app.ts`, 'utf-8');

  it('app.ts registers versions from the registry, not inline', () => {
    expect(appSource).toContain('versionRegistry');
  });

  it('app.ts defines no per-version routes itself', () => {
    // No hardcoded version-prefixed paths like '/v1/...' outside the registry.
    expect(appSource).not.toMatch(/['"`]\/v\d/);
  });
});

describe('version-scoped routes (AC2, AC3)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves a valid OpenAPI 3 spec at /v1/openapi.json (AC2)', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/openapi.json' });
    expect(res.statusCode).toBe(200);
    const body = res.json<{ openapi: string }>();
    expect(body.openapi).toMatch(/^3\./);
  });

  it('does not serve v1 routes at the root (AC3)', async () => {
    const res = await app.inject({ method: 'GET', url: '/openapi.json' });
    expect(res.statusCode).toBe(404);
  });

  it('does not serve v1 routes under an unregistered version prefix (AC3)', async () => {
    const res = await app.inject({ method: 'GET', url: '/v2/openapi.json' });
    expect(res.statusCode).toBe(404);
  });
});
