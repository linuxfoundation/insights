// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Env } from './env';

export const USERNAME_CLAIM = 'http://lfx.dev/claims/username';

export interface TokenExchangeResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  issued_token_type: 'urn:ietf:params:oauth:token-type:access_token';
}

export async function exchangePat(pat: string, env: Env): Promise<TokenExchangeResponse | null> {
  if (!env.STUB_PAT || !env.STUB_USERNAME || pat !== env.STUB_PAT) return null;
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: unsignedJwt({
      iss: 'https://stub.auth0.invalid/',
      sub: `auth0|${env.STUB_USERNAME}`,
      aud: 'https://api.insights.linuxfoundation.org',
      iat: now,
      exp: now + 600,
      [USERNAME_CLAIM]: env.STUB_USERNAME,
    }),
    token_type: 'Bearer',
    expires_in: 600,
    issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
  };
}

export function usernameFromJwt(jwt: string): string | null {
  const payload = jwt.split('.')[1];
  if (!payload) return null;
  try {
    const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof claims[USERNAME_CLAIM] === 'string' ? claims[USERNAME_CLAIM] : null;
  } catch {
    return null;
  }
}

function unsignedJwt(claims: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(claims)}.`;
}
