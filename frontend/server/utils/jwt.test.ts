// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { getCookie, type H3Event } from 'h3';
import jwt from 'jsonwebtoken';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { signRefreshCookie } from './auth-refresh';
import { getOptionalUser } from './jwt';

vi.mock('h3', async (importOriginal) => ({
  ...(await importOriginal<typeof import('h3')>()),
  getCookie: vi.fn(),
}));

mockNuxtImport('useRuntimeConfig', (original) => () => ({
  ...original(),
  auth0ClientSecret: 'test-secret',
  redisUrl: '',
}));

const event = {} as H3Event;
const now = () => Math.floor(Date.now() / 1000);
const withSessionCookie = (value: string) =>
  vi
    .mocked(getCookie)
    .mockImplementation((_event, name) => (name === 'insights_oidc_token' ? value : undefined));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getOptionalUser', () => {
  it('returns the user for a valid session cookie', async () => {
    withSessionCookie(jwt.sign({ sub: 'auth0|u', iat: now(), exp: now() + 60 }, 'test-secret'));

    expect(await getOptionalUser(event)).toMatchObject({ sub: 'auth0|u' });
  });

  it('rejects a refresh wrapper presented as the session cookie', async () => {
    withSessionCookie(signRefreshCookie({ rt: 'rt', sub: 'auth0|u', sid: 's', auth_time: now() }));

    expect(await getOptionalUser(event)).toBeNull();
  });

  it('rejects a session cookie carrying the refresh purpose claim', async () => {
    withSessionCookie(
      jwt.sign({ sub: 'auth0|u', typ: 'insights-refresh', exp: now() + 60 }, 'test-secret'),
    );

    expect(await getOptionalUser(event)).toBeNull();
  });
});
