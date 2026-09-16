// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { API_VERSIONS, specVersionFor } from '../src/versions.js';

const apiRoot = fileURLToPath(new URL('..', import.meta.url));

interface OpenApiDoc {
  openapi: string;
  info: { version: string };
  paths: Record<string, unknown>;
}

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
  it('lists v1 as the only supported version', () => {
    expect(API_VERSIONS).toEqual(['v1']);
  });

  it('maps version ids to spec info.version values', () => {
    expect(specVersionFor('v1')).toBe('1.0.0');
    expect(specVersionFor('v2')).toBe('2.0.0');
    expect(specVersionFor('v1-alpha')).toBe('1.0.0-alpha');
  });

  it('is the single source of the version list for the app and the export script', () => {
    expect(readFileSync(join(apiRoot, 'src/app.ts'), 'utf-8')).toContain("from './versions.js'");
    expect(readFileSync(join(apiRoot, 'scripts/export-openapi.ts'), 'utf-8')).toContain(
      "from '../src/versions.js'",
    );
  });
});

describe('served per-version spec (AC2)', () => {
  it('serves a valid v1 document with info.version 1.0.0 and only /v1/ paths', async () => {
    app = await buildApp();
    app.get('/v1/ping', async () => ({ ok: true }));
    await app.ready();

    const spec = await getSpec(app, '/v1/openapi.json');
    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.info.version).toBe('1.0.0');
    expect(Object.keys(spec.paths)).toEqual(['/v1/ping']);
  });
});

describe('cross-version isolation (AC3)', () => {
  it('serves one spec per registered version, each containing only its own routes', async () => {
    app = await buildApp({ versions: ['v1', 'v2'] });
    app.get('/v1/ping', async () => ({ ok: true }));
    app.get('/v2/ping', async () => ({ ok: true }));
    await app.ready();

    const v1 = await getSpec(app, '/v1/openapi.json');
    const v2 = await getSpec(app, '/v2/openapi.json');
    expect(v1.info.version).toBe('1.0.0');
    expect(v2.info.version).toBe('2.0.0');
    expect(Object.keys(v1.paths)).toEqual(['/v1/ping']);
    expect(Object.keys(v2.paths)).toEqual(['/v2/ping']);
  });

  it('does not leak /v1-alpha/ routes into the /v1 spec despite the shared prefix', async () => {
    app = await buildApp({ versions: ['v1', 'v1-alpha'] });
    app.get('/v1/ping', async () => ({ ok: true }));
    app.get('/v1-alpha/ping', async () => ({ ok: true }));
    await app.ready();

    const v1 = await getSpec(app, '/v1/openapi.json');
    const alpha = await getSpec(app, '/v1-alpha/openapi.json');
    expect(alpha.info.version).toBe('1.0.0-alpha');
    expect(Object.keys(v1.paths)).toEqual(['/v1/ping']);
    expect(Object.keys(alpha.paths)).toEqual(['/v1-alpha/ping']);
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
    app = await buildApp({ versions: ['v1', 'v2'] });
    await app.ready();

    const v1 = await getSpec(app, '/v1/openapi.json');
    const v2 = await getSpec(app, '/v2/openapi.json');
    expect(Object.keys(v1.paths)).toEqual([]);
    expect(Object.keys(v2.paths)).toEqual([]);
  });
});
