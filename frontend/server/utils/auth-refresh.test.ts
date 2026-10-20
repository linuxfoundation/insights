// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3';
import jwt from 'jsonwebtoken';
import { refreshTokenGrant } from 'openid-client';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { verifyOrRefreshOidcToken } from './auth-refresh';

vi.mock('h3', async (importOriginal) => ({
  ...(await importOriginal<typeof import('h3')>()),
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));
vi.mock('openid-client', () => ({
  discovery: vi.fn(async () => ({})),
  refreshTokenGrant: vi.fn(async () => ({
    id_token: 'id-token',
    expires_in: 60,
    refresh_token: 'rt-next',
  })),
}));
vi.mock('jwt-decode', () => ({ jwtDecode: vi.fn(() => ({ sub: 'auth0|u', sid: 'sid-1' })) }));

const secret = 'test-secret';
mockNuxtImport('useRuntimeConfig', (original) => () => ({
  ...original(),
  auth0ClientSecret: 'test-secret',
  lfxAuth0TokenClaimGroupKey: 'claims',
  redisUrl: 'redis://redis:6379',
}));

// Real revocation helper over an in-memory store, so the sub and sid comparisons are exercised.
const store = new Map<string, unknown>();
vi.stubGlobal(
  'useStorage',
  vi.fn(() => ({
    getItems: async (keys: string[]) => keys.map((key) => ({ key, value: store.get(key) ?? null })),
  })),
);

let cookies: Record<string, string | undefined>;
const event = {} as H3Event;
const now = () => Math.floor(Date.now() / 1000);
const loggedInAt = now() - 3600;
const mint = (claims: object) =>
  jwt.sign(
    { sub: 'auth0|u', sid: 'sid-1', auth_time: loggedInAt, iat: now(), exp: now() + 60, ...claims },
    secret,
  );
const refreshCookie = (rt = 'rt-1') =>
  jwt.sign({ rt, sub: 'auth0|u', sid: 'sid-1', auth_time: loggedInAt }, secret);

beforeEach(() => {
  vi.clearAllMocks();
  store.clear();
  cookies = {};
  vi.mocked(getCookie).mockImplementation((_event, name) => cookies[name]);
});

const setCookieValue = (name: string) =>
  vi.mocked(setCookie).mock.calls.find(([, n]) => n === name)?.[2];

const expectAuthCookiesCleared = () => {
  const cleared = vi.mocked(deleteCookie).mock.calls.map(([, name]) => name);
  expect(cleared).toEqual(
    expect.arrayContaining(['insights_oidc_token', 'insights_refresh_token']),
  );
};

describe('verifyOrRefreshOidcToken back-channel revocation', () => {
  it('returns a valid, unrevoked session', async () => {
    cookies.insights_oidc_token = mint({});

    expect(await verifyOrRefreshOidcToken(event)).toMatchObject({ sid: 'sid-1' });
  });

  it('rejects a revoked session without refreshing it', async () => {
    cookies.insights_oidc_token = mint({});
    cookies.insights_refresh_token = refreshCookie();
    store.set('auth:revoked_sid:sid-1', now());

    expect(await verifyOrRefreshOidcToken(event)).toBeNull();
    expect(refreshTokenGrant).not.toHaveBeenCalled();
    expectAuthCookiesCleared();
  });

  it('judges a sub-wide logout by auth time, not by when the cookie was minted', async () => {
    cookies.insights_oidc_token = mint({ iat: now() });
    store.set('auth:revoked_sub:auth0|u', now() - 60);

    expect(await verifyOrRefreshOidcToken(event)).toBeNull();
  });

  it('refuses to refresh after a sub-wide logout once the OIDC cookie has expired', async () => {
    cookies.insights_refresh_token = refreshCookie('rt-sub');
    store.set('auth:revoked_sub:auth0|u', now() - 60);

    expect(await verifyOrRefreshOidcToken(event)).toBeNull();
    expect(refreshTokenGrant).not.toHaveBeenCalled();
    expectAuthCookiesCleared();
  });

  it('refuses to refresh a revoked sid once the OIDC cookie has expired', async () => {
    cookies.insights_refresh_token = refreshCookie('rt-sid');
    store.set('auth:revoked_sid:sid-1', now() - 60);

    expect(await verifyOrRefreshOidcToken(event)).toBeNull();
    expect(refreshTokenGrant).not.toHaveBeenCalled();
    expectAuthCookiesCleared();
  });

  it('keeps the original sid and auth time when re-minting', async () => {
    cookies.insights_refresh_token = refreshCookie('rt-keep');

    expect(await verifyOrRefreshOidcToken(event)).toMatchObject({
      sid: 'sid-1',
      auth_time: loggedInAt,
    });
    expect(refreshTokenGrant).toHaveBeenCalledWith(expect.anything(), 'rt-keep');
    expect(jwt.verify(setCookieValue('insights_oidc_token')!, secret)).toMatchObject({
      sid: 'sid-1',
      auth_time: loggedInAt,
    });
    expect(jwt.verify(setCookieValue('insights_refresh_token')!, secret)).toMatchObject({
      rt: 'rt-next',
      sub: 'auth0|u',
      sid: 'sid-1',
      auth_time: loggedInAt,
    });
  });

  it('still refreshes a legacy raw refresh cookie', async () => {
    cookies.insights_refresh_token = 'legacy-raw-rt';

    expect(await verifyOrRefreshOidcToken(event)).toMatchObject({ sid: 'sid-1' });
    expect(refreshTokenGrant).toHaveBeenCalledWith(expect.anything(), 'legacy-raw-rt');
  });

  it('rejects a legacy refresh whose new ID token names a revoked sid', async () => {
    cookies.insights_refresh_token = 'legacy-revoked-rt';
    store.set('auth:revoked_sid:sid-1', now());

    expect(await verifyOrRefreshOidcToken(event)).toBeNull();
    expect(refreshTokenGrant).toHaveBeenCalledTimes(1);
    expect(setCookieValue('insights_oidc_token')).toBeUndefined();
    expectAuthCookiesCleared();
  });
});
