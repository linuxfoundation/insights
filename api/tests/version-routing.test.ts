// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { versionRegistry } from '../src/versions/registry.js';

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

describe('version-scoped routes (AC1, AC2, AC3, AC4)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('mounts every route under a registry prefix (AC1, AC4)', () => {
    const printed = app.printRoutes({ commonPrefix: false });
    const paths = [...printed.matchAll(/(\/[^\s(]*) \(/g)].map((match) => match[1]);
    expect(paths.length).toBeGreaterThan(0);
    const prefixes = versionRegistry.map((entry) => entry.prefix);
    for (const path of paths) {
      expect(
        prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)),
        `route ${path} is outside every registered version prefix`,
      ).toBe(true);
    }
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
