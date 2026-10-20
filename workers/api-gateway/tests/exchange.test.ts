// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Env } from '../src/env';
import { exchangePat } from '../src/exchange';

const keys = (await crypto.subtle.generateKey(
  {
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
  },
  true,
  ['sign', 'verify'],
)) as CryptoKeyPair;
const pkcs8 = Buffer.from(await crypto.subtle.exportKey('pkcs8', keys.privateKey));
const pem = `-----BEGIN PRIVATE KEY-----\n${pkcs8.toString('base64')}\n-----END PRIVATE KEY-----\n`;

const env = {
  M2M_ISSUER_URL: 'https://auth.test/',
  M2M_CLIENT_ID: 'client',
  M2M_PRIVATE_KEY: Buffer.from(pem).toString('base64'),
  INSIGHTS_API_AUDIENCE: 'https://insights-api.test/',
} as Env;

const tokens = { access_token: 'access-jwt', token_type: 'Bearer', expires_in: 10800 };

function stubAuth0(response: Response) {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('exchangePat', () => {
  it('exchanges the PAT through Auth0 Custom Token Exchange', async () => {
    const fetchMock = stubAuth0(Response.json(tokens));

    expect(await exchangePat('lfi_abc123', '203.0.113.7', env)).toEqual(tokens);

    const [input, init] = fetchMock.mock.calls[0]!;
    expect(String(input)).toBe('https://auth.test/oauth/token');
    expect(init!.method).toBe('POST');
    expect(new Headers(init!.headers).get('auth0-forwarded-for')).toBe('203.0.113.7');
    const { client_assertion: assertion, ...body } = JSON.parse(String(init!.body));
    expect(body).toEqual({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      subject_token: 'lfi_abc123',
      subject_token_type: 'urn:lfx.dev:pat',
      audience: 'https://insights-api.test/',
      client_id: 'client',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    });
    const claims = JSON.parse(Buffer.from(assertion.split('.')[1], 'base64url').toString());
    expect(claims).toMatchObject({ iss: 'client', sub: 'client', aud: 'https://auth.test/' });
  });

  it('omits the forwarded-for header without a client IP', async () => {
    const fetchMock = stubAuth0(Response.json(tokens));

    await exchangePat('lfi_abc123', null, env);

    expect(new Headers(fetchMock.mock.calls[0]![1]!.headers).has('auth0-forwarded-for')).toBe(
      false,
    );
  });

  it.each([
    [Response.json({ error: 'invalid_grant' }, { status: 400 }), '400 invalid_grant'],
    [Response.json({ error: 'invalid_request' }, { status: 400 }), '400 invalid_request'],
    [Response.json({ error: 'unauthorized_client' }, { status: 401 }), '401 unauthorized_client'],
    [Response.json({ error: 'access_denied' }, { status: 403 }), '403 access_denied'],
    [new Response('forbidden', { status: 403 }), '403 unknown'],
  ])('returns null when Auth0 rejects the PAT (%#)', async (response, logged) => {
    stubAuth0(response);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(await exchangePat('lfi_revoked', '203.0.113.7', env)).toBeNull();
    expect(warn).toHaveBeenCalledWith(`token exchange rejected: ${logged}`);
    expect(String(warn.mock.calls[0])).not.toContain('lfi_');
  });

  it.each([
    [new Response('unavailable', { status: 503 }), 'token exchange failed: 503'],
    [Response.json({ error: 'too_many_attempts' }, { status: 429 }), '429 too_many_attempts'],
    [Response.json({ error: 'server_error' }, { status: 403 }), '403 server_error'],
  ])('throws when Auth0 or the PAT service fails (%#)', async (response, message) => {
    stubAuth0(response);

    await expect(exchangePat('lfi_abc123', null, env)).rejects.toThrow(message);
  });
});
