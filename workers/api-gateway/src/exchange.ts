// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Env } from './env';
import { ASSERTION_TYPE, clientAssertion } from './m2m';

export const USERNAME_CLAIM = 'http://lfx.dev/claims/username';

const TOKEN_EXCHANGE_GRANT = 'urn:ietf:params:oauth:grant-type:token-exchange';
const PAT_TOKEN_TYPE = 'urn:lfx.dev:pat';

export interface TokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function exchangePat(
  pat: string,
  clientIp: string | null,
  env: Env,
): Promise<TokenExchangeResponse | null> {
  const headers = new Headers({ 'content-type': 'application/json' });
  // Auth0 throttles failed exchanges by IP; without this every caller shares the Worker's IP.
  if (clientIp) headers.set('auth0-forwarded-for', clientIp);

  const response = await fetch(new URL('oauth/token', env.M2M_ISSUER_URL), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      grant_type: TOKEN_EXCHANGE_GRANT,
      subject_token: pat,
      subject_token_type: PAT_TOKEN_TYPE,
      audience: env.INSIGHTS_API_AUDIENCE,
      client_id: env.M2M_CLIENT_ID,
      client_assertion_type: ASSERTION_TYPE,
      client_assertion: await clientAssertion(env),
    }),
  });
  if (response.status >= 500) throw new Error(`token exchange failed: ${response.status}`);
  if (!response.ok) {
    const { error = 'unknown' } = (await response.json().catch(() => ({}))) as { error?: string };
    // Auth0 answers throttling and its own lookup failures with a 4xx, so keep them from reading as a bad PAT.
    if (response.status === 429 || error === 'server_error') {
      throw new Error(`token exchange failed: ${response.status} ${error}`);
    }
    console.warn(`token exchange rejected: ${response.status} ${error}`);
    return null;
  }
  return (await response.json()) as TokenExchangeResponse;
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
