// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Env } from './env';

const EXPIRY_MARGIN_MS = 60_000;
const ASSERTION_TTL_SECONDS = 60;
const ASSERTION_TYPE = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';

let cached: { token: string; expiresAt: number } | undefined;

export async function m2mToken(env: Env): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const response = await fetch(new URL('oauth/token', env.M2M_ISSUER_URL), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: env.M2M_CLIENT_ID,
      client_assertion_type: ASSERTION_TYPE,
      client_assertion: await clientAssertion(env),
      audience: env.M2M_AUDIENCE,
    }),
  });
  if (!response.ok) throw new Error(`M2M token request failed: ${response.status}`);

  const body = (await response.json()) as { access_token: string; expires_in: number };
  cached = {
    token: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000 - EXPIRY_MARGIN_MS,
  };
  return cached.token;
}

async function clientAssertion(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: env.M2M_CLIENT_ID,
    sub: env.M2M_CLIENT_ID,
    aud: env.M2M_ISSUER_URL,
    iat: now,
    exp: now + ASSERTION_TTL_SECONDS,
    jti: crypto.randomUUID(),
  };
  const input = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claims))}`;
  const key = await importPrivateKey(env.M2M_PRIVATE_KEY);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(input),
  );
  return `${input}.${base64Url(new Uint8Array(signature))}`;
}

function importPrivateKey(pemBase64: string): Promise<CryptoKey> {
  const der = atob(atob(pemBase64).replace(/-----[^-]+-----|\s/g, ''));
  return crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(der, (c) => c.charCodeAt(0)),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

function base64Url(value: string | Uint8Array): string {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
