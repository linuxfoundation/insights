// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { specVersionFor, versionRegistry, type ApiVersion } from '../src/versions/registry.js';

const apiRoot = fileURLToPath(new URL('..', import.meta.url));

interface OpenApiDoc {
  openapi: string;
  info: { version: string };
  paths: Record<string, unknown>;
  components?: { schemas?: Record<string, { title?: string }> };
}

const pingVersion = (prefix: string): ApiVersion => ({
  prefix,
  plugin: async (scope) => {
    scope.get('/ping', async () => ({ ok: true }));
  },
});

const emptyVersion = (prefix: string): ApiVersion => ({
  prefix,
  plugin: async () => {},
});

const nestedRefVersion = (prefix: string, title: string): ApiVersion => ({
  prefix,
  plugin: async (scope) => {
    scope.addSchema({
      $id: title,
      title,
      type: 'object',
      properties: { name: { type: 'string' } },
    });
    scope.get(
      '/part',
      {
        schema: {
          response: {
            200: { type: 'object', properties: { part: { $ref: `${title}#/properties/name` } } },
          },
        },
      },
      async () => ({ part: 'thing' }),
    );
  },
});

const schemaVersion = (prefix: string, title: string): ApiVersion => ({
  prefix,
  plugin: async (scope) => {
    scope.addSchema({
      $id: title,
      title,
      type: 'object',
      properties: { name: { type: 'string' } },
    });
    scope.get('/thing', { schema: { response: { 200: { $ref: `${title}#` } } } }, async () => ({
      name: 'thing',
    }));
  },
});

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

async function getSpec(instance: FastifyInstance, url: string): Promise<OpenApiDoc> {
  const res = await instance.inject({ method: 'GET', url });
  expect(res.statusCode).toBe(200);
  return res.json<OpenApiDoc>();
}

describe('version registry (AC1)', () => {
  it('lists /v1 and /v1-alpha as the supported versions', () => {
    expect(versionRegistry.map((entry) => entry.prefix)).toEqual(['/v1', '/v1-alpha']);
  });

  it('maps version prefixes to spec info.version values', () => {
    expect(specVersionFor('/v1')).toBe('1.0.0');
    expect(specVersionFor('/v2')).toBe('2.0.0');
    expect(specVersionFor('/v1-alpha')).toBe('1.0.0-alpha');
  });

  it('is the single source of the version list for the app and the export script', () => {
    expect(readFileSync(join(apiRoot, 'src/app.ts'), 'utf-8')).toContain(
      "from './versions/registry.js'",
    );
    expect(readFileSync(join(apiRoot, 'scripts/export-openapi.ts'), 'utf-8')).toContain(
      "from '../src/versions/registry.js'",
    );
  });
});

describe('served per-version spec (AC2)', () => {
  it('serves a valid v1 document with info.version 1.0.0 and only /v1/ paths', async () => {
    app = await buildApp({ versions: [pingVersion('/v1')] });
    await app.ready();

    const spec = await getSpec(app, '/v1/openapi.json');
    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.info.version).toBe('1.0.0');
    expect(Object.keys(spec.paths)).toEqual(['/v1/ping']);
  });
});

describe('cross-version isolation (AC3)', () => {
  it('serves one spec per registered version, each containing only its own routes', async () => {
    app = await buildApp({ versions: [pingVersion('/v1'), pingVersion('/v2')] });
    await app.ready();

    const v1 = await getSpec(app, '/v1/openapi.json');
    const v2 = await getSpec(app, '/v2/openapi.json');
    expect(v1.info.version).toBe('1.0.0');
    expect(v2.info.version).toBe('2.0.0');
    expect(Object.keys(v1.paths)).toEqual(['/v1/ping']);
    expect(Object.keys(v2.paths)).toEqual(['/v2/ping']);
  });

  it('does not leak /v1-alpha/ routes into the /v1 spec despite the shared prefix', async () => {
    app = await buildApp({ versions: [pingVersion('/v1'), pingVersion('/v1-alpha')] });
    await app.ready();

    const v1 = await getSpec(app, '/v1/openapi.json');
    const alpha = await getSpec(app, '/v1-alpha/openapi.json');
    expect(alpha.info.version).toBe('1.0.0-alpha');
    expect(Object.keys(v1.paths)).toEqual(['/v1/ping']);
    expect(Object.keys(alpha.paths)).toEqual(['/v1-alpha/ping']);
  });

  it("keeps only the schemas referenced by the version's own routes", async () => {
    app = await buildApp({
      versions: [schemaVersion('/v1', 'V1Thing'), schemaVersion('/v2', 'V2Thing')],
    });
    await app.ready();

    const v1 = await getSpec(app, '/v1/openapi.json');
    const v2 = await getSpec(app, '/v2/openapi.json');
    const titles = (spec: OpenApiDoc) =>
      Object.values(spec.components?.schemas ?? {}).map((schema) => schema.title);
    expect(titles(v1)).toEqual(['V1Thing']);
    expect(titles(v2)).toEqual(['V2Thing']);
  });

  it('keeps a schema reached only through a nested pointer ref', async () => {
    app = await buildApp({ versions: [nestedRefVersion('/v1', 'V1Deep')] });
    await app.ready();

    const v1 = await getSpec(app, '/v1/openapi.json');
    const titles = Object.values(v1.components?.schemas ?? {}).map((schema) => schema.title);
    expect(titles).toEqual(['V1Deep']);
  });

  it('does not serve a spec for an unregistered version', async () => {
    app = await buildApp();
    await app.ready();

    const res = await app.inject({ method: 'GET', url: '/v2/openapi.json' });
    expect(res.statusCode).toBe(404);
  });
});

describe('spec routes are hidden (AC4)', () => {
  it('omits the openapi.json routes from every spec', async () => {
    app = await buildApp({ versions: [emptyVersion('/v1'), emptyVersion('/v2')] });
    await app.ready();

    const v1 = await getSpec(app, '/v1/openapi.json');
    const v2 = await getSpec(app, '/v2/openapi.json');
    expect(Object.keys(v1.paths)).toEqual([]);
    expect(Object.keys(v2.paths)).toEqual([]);
  });
});
