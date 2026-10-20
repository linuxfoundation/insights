// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTPayload } from 'jose';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

import {
  isSessionRevoked,
  revokeSession,
  verifyLogoutToken,
  BACKCHANNEL_LOGOUT_EVENT,
} from './backchannel-logout';

const { runtimeConfig } = vi.hoisted(() => ({ runtimeConfig: { redisUrl: 'redis://redis:6379' } }));
mockNuxtImport('useRuntimeConfig', (original) => () => ({ ...original(), ...runtimeConfig }));

const store = new Map<string, unknown>();
const storage = {
  setItem: vi.fn(async (key: string, value: unknown) => {
    store.set(key, value);
  }),
  getItems: vi.fn(async (keys: string[]) =>
    keys.map((key) => ({ key, value: store.has(key) ? store.get(key) : null })),
  ),
};
vi.stubGlobal(
  'useStorage',
  vi.fn(() => storage),
);

const issuer = 'https://sso.example/';
const audience = 'insights-client';
let jwks: ReturnType<typeof createLocalJWKSet>;
let signingKey: CryptoKey;
let otherKey: CryptoKey;

beforeAll(async () => {
  const pair = await generateKeyPair('RS256');
  signingKey = pair.privateKey;
  otherKey = (await generateKeyPair('RS256')).privateKey;
  jwks = createLocalJWKSet({ keys: [{ ...(await exportJWK(pair.publicKey)), kid: 'k1' }] });
});

beforeEach(() => {
  vi.clearAllMocks();
  store.clear();
  runtimeConfig.redisUrl = 'redis://redis:6379';
});

const sign = (
  claims: JWTPayload,
  key: CryptoKey = signingKey,
  iat = Math.floor(Date.now() / 1000),
) =>
  new SignJWT({
    iss: issuer,
    aud: audience,
    events: { [BACKCHANNEL_LOGOUT_EVENT]: {} },
    sid: 'sid-1',
    sub: 'auth0|u',
    ...claims,
  })
    .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
    .setIssuedAt(iat)
    .sign(key);

const verify = (token: string) => verifyLogoutToken(token, jwks, { issuer, audience });

describe('verifyLogoutToken', () => {
  it('accepts a valid Auth0 logout token', async () => {
    await expect(verify(await sign({}))).resolves.toEqual({ sid: 'sid-1', sub: 'auth0|u' });
  });

  it('accepts a token carrying only sub', async () => {
    await expect(verify(await sign({ sid: undefined }))).resolves.toEqual({
      sid: undefined,
      sub: 'auth0|u',
    });
  });

  it('rejects the wrong audience', async () => {
    await expect(verify(await sign({ aud: 'other-client' }))).rejects.toThrow();
  });

  it('rejects the wrong issuer', async () => {
    await expect(verify(await sign({ iss: 'https://evil.example/' }))).rejects.toThrow();
  });

  it('rejects a token without the back-channel logout event', async () => {
    await expect(verify(await sign({ events: { 'http://other/event': {} } }))).rejects.toThrow();
    await expect(verify(await sign({ events: undefined }))).rejects.toThrow();
  });

  it('rejects a token containing a nonce', async () => {
    await expect(verify(await sign({ nonce: 'n' }))).rejects.toThrow();
  });

  it('rejects a token with neither sid nor sub', async () => {
    await expect(verify(await sign({ sid: undefined, sub: undefined }))).rejects.toThrow();
  });

  it('rejects a token issued too long ago', async () => {
    const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600;
    await expect(verify(await sign({}, signingKey, tenMinutesAgo))).rejects.toThrow();
  });

  it('rejects a token signed by another key', async () => {
    await expect(verify(await sign({}, otherKey))).rejects.toThrow();
  });
});

describe('session revocation store', () => {
  const token = { sub: 'auth0|u', sid: 'sid-1', iat: 1000 };

  it('flags a session whose sid was revoked', async () => {
    await revokeSession({ sid: 'sid-1', sub: 'auth0|u' });

    expect(storage.setItem).toHaveBeenCalledWith('auth:revoked_sid:sid-1', expect.any(Number), {
      ttl: 60 * 60 * 24 * 30,
    });
    await expect(isSessionRevoked(token)).resolves.toBe(true);
    await expect(isSessionRevoked({ ...token, sid: 'sid-2' })).resolves.toBe(false);
  });

  it('flags sessions authenticated before a sub-wide logout only', async () => {
    store.set('auth:revoked_sub:auth0|u', 2000);

    await expect(isSessionRevoked({ ...token, auth_time: 1500, iat: 2500 })).resolves.toBe(true);
    await expect(isSessionRevoked({ ...token, auth_time: 2500, iat: 2500 })).resolves.toBe(false);
  });

  it('falls back to iat for cookies minted without auth_time', async () => {
    store.set('auth:revoked_sub:auth0|u', 2000);

    await expect(isSessionRevoked({ ...token, iat: 1500 })).resolves.toBe(true);
    await expect(isSessionRevoked({ ...token, iat: 2500 })).resolves.toBe(false);
  });

  it('records a sub-wide logout when the token has no sid', async () => {
    await revokeSession({ sub: 'auth0|u' });

    expect(storage.setItem).toHaveBeenCalledWith('auth:revoked_sub:auth0|u', expect.any(Number), {
      ttl: 60 * 60 * 24 * 30,
    });
  });

  it('reads both keys in a single call', async () => {
    await isSessionRevoked(token);

    expect(storage.getItems).toHaveBeenCalledTimes(1);
  });

  it('skips the lookup when Redis is not configured', async () => {
    runtimeConfig.redisUrl = '';

    await expect(isSessionRevoked(token)).resolves.toBe(false);
    expect(storage.getItems).not.toHaveBeenCalled();
  });

  it('fails open when Redis errors', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    storage.getItems.mockRejectedValueOnce(new Error('down'));

    await expect(isSessionRevoked(token)).resolves.toBe(false);
  });
});
