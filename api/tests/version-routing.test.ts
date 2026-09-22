// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { versionRegistry } from '../src/versions/registry.js';

// printRoutes nests a route under the longest route that prefixes it and prints only the
// remainder, so a full path is its ancestors' labels joined with its own. Each tree level
// indents by four characters.
function listRoutePaths(app: FastifyInstance): string[] {
  const labels: string[] = [];
  const paths: string[] = [];
  for (const line of app.printRoutes({ commonPrefix: false }).split('\n')) {
    const match = /^([│├└─ ]*)(\S+) \(/.exec(line);
    if (!match) continue;
    const depth = match[1].length / 4;
    labels.length = depth;
    labels[depth] = match[2];
    paths.push(labels.join(''));
  }
  return paths;
}

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

  it('mounts every route under a registry prefix, except ADR 0009 surfaces (AC1, AC4)', () => {
    // ADR 0009 reserves these unversioned surfaces; everything else must be version-scoped.
    const unversioned = ['/health/live', '/health/ready', '/docs'];
    // @fastify/static serves the docs tree from a `/docs*` wildcard route.
    const scoped = listRoutePaths(app).filter(
      (path) =>
        !unversioned.some((u) => path === u || path.startsWith(`${u}/`) || path === `${u}*`),
    );
    expect(scoped.length).toBeGreaterThan(0);
    const prefixes = versionRegistry.map((entry) => entry.prefix);
    for (const path of scoped) {
      expect(
        prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)),
        `route ${path} is outside every registered version prefix`,
      ).toBe(true);
    }
  });

  it('reads the full path of a route nested under a parameter route (AC1)', async () => {
    const nested = await buildApp({
      versions: [
        {
          prefix: '/v1',
          plugin: async (scope) => {
            scope.get('/projects/:slug', async () => ({}));
            scope.get('/projects/:slug/development/ping', async () => ({}));
          },
        },
      ],
    });
    await nested.ready();
    try {
      expect(listRoutePaths(nested)).toEqual(
        expect.arrayContaining(['/v1/projects/:slug', '/v1/projects/:slug/development/ping']),
      );
    } finally {
      await nested.close();
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
