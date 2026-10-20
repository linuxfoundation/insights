// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { H3Event } from 'h3';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

import { BACKCHANNEL_LOGOUT_EVENT, revokeSession } from '../../utils/backchannel-logout';

const { keys, runtimeConfig } = vi.hoisted(() => ({
  keys: { jwks: { keys: [] as object[] } },
  runtimeConfig: {
    redisUrl: 'redis://redis:6379',
    public: { auth0Domain: 'sso.example', auth0ClientId: 'insights-client' },
  },
}));

vi.mock('openid-client', () => ({
  discovery: vi.fn(async () => ({
    serverMetadata: () => ({
      issuer: 'https://sso.example/',
      jwks_uri: 'https://sso.example/.well-known/jwks.json',
    }),
  })),
}));
vi.mock('jose', async (importOriginal) => {
  const jose = await importOriginal<typeof import('jose')>();
  return { ...jose, createRemoteJWKSet: () => jose.createLocalJWKSet(keys.jwks as never) };
});
vi.mock('../../utils/backchannel-logout', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils/backchannel-logout')>()),
  revokeSession: vi.fn(async () => {}),
}));

mockNuxtImport('useRuntimeConfig', (original) => () => {
  const config = original();
  return { ...config, ...runtimeConfig, public: { ...config.public, ...runtimeConfig.public } };
});

const mockReadBody = vi.fn();
const mockSetResponseHeader = vi.fn();
global.defineEventHandler = vi.fn((handler) => handler);
vi.stubGlobal('readBody', mockReadBody);
vi.stubGlobal('setResponseHeader', mockSetResponseHeader);
global.createError = vi.fn((error) => error);

let handler: (event: H3Event) => Promise<unknown>;
let privateKey: CryptoKey;

beforeAll(async () => {
  const pair = await generateKeyPair('RS256');
  privateKey = pair.privateKey;
  keys.jwks.keys = [{ ...(await exportJWK(pair.publicKey)), kid: 'k1' }];
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  handler = (await import('./backchannel-logout.post')).default as unknown as typeof handler;
});

beforeEach(() => {
  vi.clearAllMocks();
  runtimeConfig.redisUrl = 'redis://redis:6379';
});

const logoutToken = (audience = 'insights-client') =>
  new SignJWT({ events: { [BACKCHANNEL_LOGOUT_EVENT]: {} }, sid: 'sid-1', sub: 'auth0|u' })
    .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
    .setIssuer('https://sso.example/')
    .setAudience(audience)
    .setIssuedAt()
    .sign(privateKey);

const event = {} as H3Event;

describe('POST /api/auth/backchannel-logout', () => {
  it('revokes the session named by a valid logout token', async () => {
    mockReadBody.mockResolvedValue({ logout_token: await logoutToken() });

    await expect(handler(event)).resolves.toBe('');

    expect(revokeSession).toHaveBeenCalledWith({ sid: 'sid-1', sub: 'auth0|u' });
    expect(mockSetResponseHeader).toHaveBeenCalledWith(event, 'cache-control', 'no-store');
  });

  it('answers 400 to a token minted for another client', async () => {
    mockReadBody.mockResolvedValue({ logout_token: await logoutToken('other-client') });

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
    expect(revokeSession).not.toHaveBeenCalled();
  });

  it('answers 400 when logout_token is missing', async () => {
    mockReadBody.mockResolvedValue({});

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('answers 503 when no session store is configured', async () => {
    runtimeConfig.redisUrl = '';
    mockReadBody.mockResolvedValue({ logout_token: await logoutToken() });

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 503 });
    expect(revokeSession).not.toHaveBeenCalled();
  });
});
