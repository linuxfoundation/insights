// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTPayload } from 'jose';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildApp, type BuildAppOptions } from '../src/app.js';
import { USERNAME_CLAIM } from '../src/auth.js';
import { mockFetch, type OpenApiDoc } from './helpers/tinybird.js';

const issuer = 'https://auth.test/';
const audience = 'https://api.test/';
const kid = 'test-key';

const { publicKey, privateKey } = await generateKeyPair('RS256');
const otherKey = (await generateKeyPair('RS256')).privateKey;
const jwks = { keys: [{ ...(await exportJWK(publicKey)), kid, alg: 'RS256' }] };
const localKeys = createLocalJWKSet(jwks);

interface TokenOptions {
  claims?: JWTPayload;
  iss?: string;
  aud?: string;
  exp?: string | number;
  key?: CryptoKey;
}

const sign = ({
  claims = {},
  iss = issuer,
  aud = audience,
  exp = '5m',
  key = privateKey,
}: TokenOptions = {}) =>
  new SignJWT({ [USERNAME_CLAIM]: 'jdoe', ...claims })
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuer(iss)
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(key);

const unauthorizedBody = {
  statusCode: 401,
  code: 'unauthorized',
  error: 'Unauthorized',
  message: 'A valid personal access token is required',
};

const whoami: BuildAppOptions['versions'] = [
  {
    prefix: '/v1-alpha',
    plugin: async (scope) => {
      scope.get('/whoami', async (request) => ({ username: request.username }));
    },
  },
];

function useAuthApp(options: BuildAppOptions) {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp(options);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.stubEnv('API_AUTH_DISABLED', '');
    vi.stubEnv('API_AUTH0_ISSUER_URL', issuer);
    vi.stubEnv('API_AUTH0_AUDIENCE', audience);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  return (url: string, authorization?: string) =>
    app.inject({ method: 'GET', url, headers: authorization ? { authorization } : {} });
}

describe('access token verification', () => {
  const get = useAuthApp({ versions: whoami, authKeys: localKeys });

  it('accepts a valid token and exposes the username', async () => {
    const response = await get('/v1-alpha/whoami', `Bearer ${await sign()}`);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ username: 'jdoe' });
  });

  it.each([
    ['no Authorization header', undefined],
    ['another scheme', 'Basic amRvZTpzZWNyZXQ='],
    ['an empty bearer token', 'Bearer '],
  ])('answers 401 for %s', async (_name, authorization) => {
    const response = await get('/v1-alpha/whoami', authorization);

    expect(response.statusCode).toBe(401);
    expect(response.headers['www-authenticate']).toBe('Bearer');
    expect(response.json()).toEqual(unauthorizedBody);
  });

  it.each([
    ['another issuer', () => sign({ iss: 'https://other-tenant.test/' })],
    ['another audience', () => sign({ aud: 'https://other-api.test/' })],
    ['an expired token', () => sign({ exp: Math.floor(Date.now() / 1000) - 60 })],
    ['a signature from another key', () => sign({ key: otherKey })],
    ['a missing username claim', () => sign({ claims: { [USERNAME_CLAIM]: undefined } })],
    ['an empty username claim', () => sign({ claims: { [USERNAME_CLAIM]: '' } })],
    [
      'an HS256 token',
      () =>
        new SignJWT({ [USERNAME_CLAIM]: 'jdoe' })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuer(issuer)
          .setAudience(audience)
          .setExpirationTime('5m')
          .sign(new TextEncoder().encode('a shared secret long enough for HS256')),
    ],
    ['a malformed token', async () => 'not-a-jwt'],
  ])('answers 401 for %s', async (_name, token) => {
    const response = await get('/v1-alpha/whoami', `Bearer ${await token()}`);

    expect(response.statusCode).toBe(401);
    expect(response.headers['www-authenticate']).toBe('Bearer');
    expect(response.json()).toEqual(unauthorizedBody);
  });

  it('skips verification while API_AUTH_DISABLED is true', async () => {
    vi.stubEnv('API_AUTH_DISABLED', 'true');

    const response = await get('/v1-alpha/whoami');

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ username: null });
  });
});

describe("Auth0's key set", () => {
  const get = useAuthApp({ versions: whoami });
  let tenant = 0;

  // A fresh issuer per test, so keys cached by an earlier test never answer for this one.
  const useTenant = () => {
    const tenantIssuer = `https://tenant-${++tenant}.auth.test/`;
    vi.stubEnv('API_AUTH0_ISSUER_URL', tenantIssuer);
    return tenantIssuer;
  };

  it('is fetched from under the issuer', async () => {
    const tenantIssuer = useTenant();
    mockFetch.mockResolvedValue(Response.json(jwks));

    const response = await get('/v1-alpha/whoami', `Bearer ${await sign({ iss: tenantIssuer })}`);

    expect(response.statusCode).toBe(200);
    expect(String(mockFetch.mock.calls[0]?.[0])).toBe(`${tenantIssuer}.well-known/jwks.json`);
  });

  it.each([
    ['unreachable', () => mockFetch.mockRejectedValue(new TypeError('fetch failed'))],
    ['failing', () => mockFetch.mockResolvedValue(new Response('down', { status: 500 }))],
    ['not JSON', () => mockFetch.mockResolvedValue(new Response('<html></html>'))],
    ['not a key set', () => mockFetch.mockResolvedValue(Response.json({}))],
    [
      'timing out',
      () => mockFetch.mockRejectedValue(new DOMException('timed out', 'TimeoutError')),
    ],
  ])('answers 503 when it is %s', async (_name, stub) => {
    const tenantIssuer = useTenant();
    stub();

    const response = await get('/v1-alpha/whoami', `Bearer ${await sign({ iss: tenantIssuer })}`);

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({ code: 'upstream_unavailable' });
  });

  it('answers 503 when the issuer is not configured', async () => {
    vi.stubEnv('API_AUTH0_ISSUER_URL', '');

    const response = await get('/v1-alpha/whoami', `Bearer ${await sign()}`);

    expect(response.statusCode).toBe(503);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('versioned routes', () => {
  const get = useAuthApp({ authKeys: localKeys });
  let doc: OpenApiDoc;

  beforeAll(async () => {
    doc = (await get('/v1-alpha/openapi.json')).json() as OpenApiDoc;
  });

  it('answer 401 without a token on every documented data route', async () => {
    const paths = Object.keys(doc.paths);
    expect(paths.length).toBeGreaterThan(50);

    for (const path of paths) {
      const response = await get(path.replace(/\{[^}]+\}/g, 'x'));

      expect(response.statusCode, path).toBe(401);
      expect(response.headers['cache-control'], path).toBe('private, max-age=0');
    }
  });

  it.each(['/v1-alpha/openapi.json', '/v1/openapi.json', '/health/live'])(
    'keep %s public',
    async (url) => {
      expect((await get(url)).statusCode).toBe(200);
    },
  );
});
