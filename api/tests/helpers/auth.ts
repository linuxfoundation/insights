// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTPayload } from 'jose';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import { buildApp, type BuildAppOptions } from '../../src/app.js';
import { USERNAME_CLAIM } from '../../src/auth.js';
import { mockFetch } from './tinybird.js';

export const issuer = 'https://auth.test/';
export const audience = 'https://api.test/';
const kid = 'test-key';

const { publicKey, privateKey } = await generateKeyPair('RS256');
export const jwks = { keys: [{ ...(await exportJWK(publicKey)), kid, alg: 'RS256' }] };
export const localKeys = createLocalJWKSet(jwks);

export interface TokenOptions {
  claims?: JWTPayload;
  iss?: string;
  aud?: string;
  exp?: string | number;
  key?: CryptoKey;
}

export const sign = ({
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

// A version with one route that echoes the verified caller.
export const whoami: BuildAppOptions['versions'] = [
  {
    prefix: '/v1-alpha',
    plugin: async (scope) => {
      scope.get('/whoami', async (request) => ({ username: request.username }));
    },
  },
];

// One app per describe block, with verification on and the test issuer and audience configured.
export function useAuthApp(options: BuildAppOptions, env: Record<string, string> = {}) {
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
    for (const [name, value] of Object.entries(env)) {
      vi.stubEnv(name, value);
    }
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  return (url: string, authorization?: string, headers: Record<string, string> = {}) =>
    app.inject({
      method: 'GET',
      url,
      headers: authorization ? { ...headers, authorization } : headers,
    });
}
