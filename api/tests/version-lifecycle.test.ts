// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import {
  versionRegistry,
  type ApiVersion,
  type VersionLifecycle,
} from '../src/versions/registry.js';

const apiRoot = fileURLToPath(new URL('..', import.meta.url));

const DEPRECATED_AT = '2026-09-01';
const SUNSET_AT = '2026-12-01';
const DOCS_URL = 'https://insights.linuxfoundation.org/docs/lifecycle';

// RFC 9745: '@' + unix seconds of the deprecation date (dates parse as UTC midnight).
const expectedDeprecation = `@${Date.parse('2026-09-01T00:00:00.000Z') / 1000}`;
// RFC 8594: Sunset is an IMF-fixdate HTTP-date.
const expectedSunset = 'Tue, 01 Dec 2026 00:00:00 GMT';

const version = (prefix: string, lifecycle?: VersionLifecycle): ApiVersion => ({
  prefix,
  plugin: async (scope) => {
    scope.get('/ping', async () => ({ ok: true }));
    scope.get('/boom', async () => {
      throw new Error('boom');
    });
  },
  ...(lifecycle ? { lifecycle } : {}),
});

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

async function respond(instance: FastifyInstance, url: string) {
  const res = await instance.inject({ method: 'GET', url });
  return res;
}

describe('registry lifecycle metadata (AC1)', () => {
  it('still ships /v1 as the only version, with no lifecycle metadata', () => {
    expect(versionRegistry.map((entry) => entry.prefix)).toEqual(['/v1']);
    expect(versionRegistry.every((entry) => entry.lifecycle === undefined)).toBe(true);
  });

  it('accepts full lifecycle metadata on a version entry', () => {
    const entry = version('/v1-alpha', {
      deprecatedAt: DEPRECATED_AT,
      sunsetAt: SUNSET_AT,
      successorPrefix: '/v1',
      deprecationDocsUrl: DOCS_URL,
    });
    expect(entry.lifecycle?.deprecatedAt).toBe(DEPRECATED_AT);
  });
});

describe('Deprecation header (AC2)', () => {
  it('stamps every route response of a deprecated version, in RFC 9745 format', async () => {
    app = await buildApp({
      versions: [version('/v1'), version('/v1-alpha', { deprecatedAt: DEPRECATED_AT })],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/ping');
    expect(res.statusCode).toBe(200);
    expect(res.headers.deprecation).toBe(expectedDeprecation);
  });

  it("stamps the deprecated version's openapi.json route", async () => {
    app = await buildApp({
      versions: [version('/v1-alpha', { deprecatedAt: DEPRECATED_AT })],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    expect(res.headers.deprecation).toBe(expectedDeprecation);
  });

  it('stamps error responses from deprecated routes', async () => {
    app = await buildApp({
      versions: [version('/v1-alpha', { deprecatedAt: DEPRECATED_AT })],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/boom');
    expect(res.statusCode).toBe(500);
    expect(res.headers.deprecation).toBe(expectedDeprecation);
  });
});

describe('Sunset header (AC3)', () => {
  it('emits Sunset as an IMF-fixdate when sunsetAt is set', async () => {
    app = await buildApp({
      versions: [version('/v1-alpha', { deprecatedAt: DEPRECATED_AT, sunsetAt: SUNSET_AT })],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/ping');
    expect(res.headers.sunset).toBe(expectedSunset);
  });

  it('omits Sunset when no sunsetAt is set', async () => {
    app = await buildApp({
      versions: [version('/v1-alpha', { deprecatedAt: DEPRECATED_AT })],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/ping');
    expect(res.headers.deprecation).toBe(expectedDeprecation);
    expect(res.headers.sunset).toBeUndefined();
  });
});

describe('Link header (AC4)', () => {
  it('links the successor version when successorPrefix is set', async () => {
    app = await buildApp({
      versions: [
        version('/v1'),
        version('/v1-alpha', { deprecatedAt: DEPRECATED_AT, successorPrefix: '/v1' }),
      ],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/ping');
    expect(res.headers.link).toBe('</v1>; rel="successor-version"');
  });

  it('links the migration docs when deprecationDocsUrl is set', async () => {
    app = await buildApp({
      versions: [
        version('/v1-alpha', { deprecatedAt: DEPRECATED_AT, deprecationDocsUrl: DOCS_URL }),
      ],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/ping');
    expect(res.headers.link).toBe(`<${DOCS_URL}>; rel="deprecation"`);
  });

  it('combines both relations into one Link header when both are set', async () => {
    app = await buildApp({
      versions: [
        version('/v1-alpha', {
          deprecatedAt: DEPRECATED_AT,
          successorPrefix: '/v1',
          deprecationDocsUrl: DOCS_URL,
        }),
      ],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/ping');
    expect(res.headers.link).toBe(
      `</v1>; rel="successor-version", <${DOCS_URL}>; rel="deprecation"`,
    );
  });

  it('omits Link when neither successor nor docs URL is set', async () => {
    app = await buildApp({
      versions: [version('/v1-alpha', { deprecatedAt: DEPRECATED_AT })],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/ping');
    expect(res.headers.link).toBeUndefined();
  });
});

describe('versions without lifecycle stay unstamped (AC5)', () => {
  it('emits none of the three headers for a live version alongside a deprecated one', async () => {
    app = await buildApp({
      versions: [
        version('/v1'),
        version('/v1-alpha', {
          deprecatedAt: DEPRECATED_AT,
          sunsetAt: SUNSET_AT,
          successorPrefix: '/v1',
          deprecationDocsUrl: DOCS_URL,
        }),
      ],
    });
    await app.ready();

    for (const url of ['/v1/ping', '/v1/openapi.json']) {
      const res = await respond(app, url);
      expect(res.statusCode).toBe(200);
      expect(res.headers.deprecation).toBeUndefined();
      expect(res.headers.sunset).toBeUndefined();
      expect(res.headers.link).toBeUndefined();
    }
  });

  it('emits none of the three headers with the shipped registry', async () => {
    app = await buildApp();
    await app.ready();

    const res = await respond(app, '/v1/openapi.json');
    expect(res.statusCode).toBe(200);
    expect(res.headers.deprecation).toBeUndefined();
    expect(res.headers.sunset).toBeUndefined();
    expect(res.headers.link).toBeUndefined();
  });
});

describe('lifecycle validation at build time (AC6)', () => {
  // Resolves to nothing so a wrongly-succeeding build closes cleanly instead of leaking an app.
  async function buildAndDiscard(versions: ApiVersion[]): Promise<void> {
    const built = await buildApp({ versions });
    await built.close();
  }

  it('rejects an unparseable deprecatedAt', async () => {
    await expect(
      buildAndDiscard([version('/v1-alpha', { deprecatedAt: 'not-a-date' })]),
    ).rejects.toThrow(/deprecatedAt/);
  });

  it('rejects an unparseable sunsetAt', async () => {
    await expect(
      buildAndDiscard([version('/v1-alpha', { deprecatedAt: DEPRECATED_AT, sunsetAt: 'someday' })]),
    ).rejects.toThrow(/sunsetAt/);
  });

  it('rejects a sunsetAt earlier than deprecatedAt', async () => {
    await expect(
      buildAndDiscard([
        version('/v1-alpha', { deprecatedAt: DEPRECATED_AT, sunsetAt: '2026-06-01' }),
      ]),
    ).rejects.toThrow(/sunset/i);
  });
});

describe('deprecation signals are documented', () => {
  it('lifecycle.md explains the three headers callers should watch for', () => {
    const lifecycle = readFileSync(join(apiRoot, 'docs/site/lifecycle.md'), 'utf-8');
    expect(lifecycle.toLowerCase()).toContain('deprecation signals');
    expect(lifecycle).toContain('`Deprecation`');
    expect(lifecycle).toContain('`Sunset`');
    expect(lifecycle).toContain('rel="deprecation"');
  });

  it('ADR 0003 records the RFC 9745 header format', () => {
    const adr = readFileSync(
      join(apiRoot, 'docs/arch/adr/0003-tolerant-reader-versioning.md'),
      'utf-8',
    );
    expect(adr).toContain('RFC 9745');
  });
});
