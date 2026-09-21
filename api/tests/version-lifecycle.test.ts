// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import {
  versionRegistry,
  type ApiVersion,
  type VersionLifecycle,
} from '../src/versions/registry.js';

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

// A version whose route sets its own Link header (string or array form).
const linkingVersion = (
  prefix: string,
  ownLink: string | string[],
  lifecycle: VersionLifecycle,
): ApiVersion => ({
  prefix,
  plugin: async (scope) => {
    scope.get('/linked', async (_request, reply) => {
      reply.header('link', ownLink);
      return { ok: true };
    });
  },
  lifecycle,
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

  it('stamps 404s for unmatched paths under the deprecated prefix', async () => {
    app = await buildApp({
      versions: [version('/v1-alpha', { deprecatedAt: DEPRECATED_AT, successorPrefix: '/v1' })],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/removed-endpoint');
    expect(res.statusCode).toBe(404);
    expect(res.headers.deprecation).toBe(expectedDeprecation);
    expect(res.headers.link).toBe('</v1>; rel="successor-version"');
  });

  it('gives deprecated prefixes the same 404 body as the root, aside from the URL', async () => {
    app = await buildApp({
      versions: [version('/v1'), version('/v1-alpha', { deprecatedAt: DEPRECATED_AT })],
    });
    await app.ready();

    const root = await respond(app, '/removed-endpoint');
    const scoped = await respond(app, '/v1-alpha/removed-endpoint');

    expect(root.statusCode).toBe(404);
    expect(scoped.statusCode).toBe(404);
    expect(scoped.json()).toEqual({
      ...root.json(),
      message: 'Route GET:/v1-alpha/removed-endpoint not found',
    });
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

  it("appends the lifecycle relations after a route's own Link instead of replacing it", async () => {
    app = await buildApp({
      versions: [
        linkingVersion('/v1-alpha', '</v1/things?cursor=abc>; rel="next"', {
          deprecatedAt: DEPRECATED_AT,
          successorPrefix: '/v1',
          deprecationDocsUrl: DOCS_URL,
        }),
      ],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/linked');
    expect(res.headers.link).toBe(
      `</v1/things?cursor=abc>; rel="next", </v1>; rel="successor-version", <${DOCS_URL}>; rel="deprecation"`,
    );
  });

  it('merges an array-valued route Link the same way', async () => {
    app = await buildApp({
      versions: [
        linkingVersion(
          '/v1-alpha',
          ['</v1/things?cursor=abc>; rel="next"', '</v1/things>; rel="first"'],
          { deprecatedAt: DEPRECATED_AT, successorPrefix: '/v1' },
        ),
      ],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/linked');
    expect(res.headers.link).toBe(
      '</v1/things?cursor=abc>; rel="next", </v1/things>; rel="first", </v1>; rel="successor-version"',
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

  it('rejects a calendar-invalid date that Date.parse would normalize', async () => {
    await expect(
      buildAndDiscard([version('/v1-alpha', { deprecatedAt: '2026-02-30' })]),
    ).rejects.toThrow(/deprecatedAt/);
    await expect(
      buildAndDiscard([
        version('/v1-alpha', { deprecatedAt: DEPRECATED_AT, sunsetAt: '2026-02-30' }),
      ]),
    ).rejects.toThrow(/sunsetAt/);
  });

  it('rejects an out-of-range month', async () => {
    await expect(
      buildAndDiscard([version('/v1-alpha', { deprecatedAt: '2026-13-01' })]),
    ).rejects.toThrow(/deprecatedAt/);
  });

  it('rejects a date without zero padding', async () => {
    await expect(
      buildAndDiscard([version('/v1-alpha', { deprecatedAt: '2026-9-1' })]),
    ).rejects.toThrow(/deprecatedAt/);
  });

  it('rejects a parseable datetime that is not the YYYY-MM-DD registry format', async () => {
    await expect(
      buildAndDiscard([version('/v1-alpha', { deprecatedAt: '2026-09-01T00:00:00Z' })]),
    ).rejects.toThrow(/deprecatedAt/);
  });

  it('accepts a sunsetAt equal to deprecatedAt and stamps both headers', async () => {
    app = await buildApp({
      versions: [version('/v1-alpha', { deprecatedAt: DEPRECATED_AT, sunsetAt: DEPRECATED_AT })],
    });
    await app.ready();

    const res = await respond(app, '/v1-alpha/ping');
    expect(res.headers.deprecation).toBe(expectedDeprecation);
    expect(res.headers.sunset).toBe('Tue, 01 Sep 2026 00:00:00 GMT');
  });
});
