// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { docsFixtureDist } from './setup/build-docs-fixture.js';

describe('static serving of the built docs site under /docs (AC1, AC4)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ docsRoot: docsFixtureDist });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the built VitePress HTML shell at /docs/, with working asset links', async () => {
    const res = await app.inject({ method: 'GET', url: '/docs/' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.body).toContain('LFX Insights API');

    const assetHrefs = [...res.body.matchAll(/(?:href|src)="(\/docs\/[^"]+)"/g)].map((m) => m[1]);
    expect(assetHrefs.length).toBeGreaterThan(0);
    for (const href of assetHrefs) {
      const assetRes = await app.inject({ method: 'GET', url: href });
      expect(assetRes.statusCode).toBe(200);
    }
  });

  it('serves the reference page with the Scalar mount point (AC1)', async () => {
    const res = await app.inject({ method: 'GET', url: '/docs/reference.html' });
    expect(res.statusCode).toBe(200);
  });

  it('serves the reference page for the extensionless nav link via the .html fallback (AC1)', async () => {
    const res = await app.inject({ method: 'GET', url: '/docs/reference' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.body).toContain('API Reference');
  });

  it('redirects /docs (no trailing slash) to /docs/', async () => {
    const res = await app.inject({ method: 'GET', url: '/docs' });
    expect(res.statusCode).toBe(301);
    expect(res.headers.location).toBe('/docs/');
  });

  it('falls through to the VitePress 404 page for an unknown docs path, not a raw Fastify 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/docs/nonexistent-page' });
    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.body).toContain('<title>404 | LFX Insights API</title>');
  });

  it('falls through to the VitePress 404 page for an unknown docs path with an extension', async () => {
    const res = await app.inject({ method: 'GET', url: '/docs/nope.html' });
    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.body).toContain('<title>404 | LFX Insights API</title>');
  });

  it('does not shadow /v1/openapi.json (AC5)', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/openapi.json' });
    expect(res.statusCode).toBe(200);
    const body = res.json<{ openapi: string }>();
    expect(body.openapi).toMatch(/^3\./);
  });

  it('answers an unmatched /v1/* route with the shared JSON 404, not the docs page (AC5)', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/does-not-exist' });
    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(res.json()).toMatchObject({ error: 'Not Found', statusCode: 404 });
  });

  it('does not treat a near-miss path like /docsomething as a docs path (AC5)', async () => {
    const res = await app.inject({ method: 'GET', url: '/docsomething' });
    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(res.json()).toMatchObject({ error: 'Not Found', statusCode: 404 });
  });
});

describe('static serving is skipped gracefully with no docs build (AC5)', () => {
  let noDocsRoot: string;
  let app: FastifyInstance;

  beforeAll(async () => {
    noDocsRoot = mkdtempSync(join(tmpdir(), 'docs-missing-'));
    rmSync(noDocsRoot, { recursive: true, force: true });
    app = await buildApp({ docsRoot: noDocsRoot });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('404s /docs/ with the docs-scoped envelope, independent of the docs build existing', async () => {
    const docsRes = await app.inject({ method: 'GET', url: '/docs/' });
    expect(docsRes.statusCode).toBe(404);
    expect(docsRes.json()).toEqual({ error: 'Not Found' });
  });

  it('404s /v1/* with the same envelope whether or not a docs build exists', async () => {
    const apiRes = await app.inject({ method: 'GET', url: '/v1/does-not-exist' });
    expect(apiRes.json()).toMatchObject({ error: 'Not Found', statusCode: 404 });
  });

  it('keeps /v1/openapi.json working with no docs build present', async () => {
    const specRes = await app.inject({ method: 'GET', url: '/v1/openapi.json' });
    expect(specRes.statusCode).toBe(200);
  });
});

describe('the built docs fixture is real (sanity check for the tests above)', () => {
  it('the shared build directory actually exists before these tests run', () => {
    expect(existsSync(docsFixtureDist)).toBe(true);
  });
});
