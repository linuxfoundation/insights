// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createRemoteJWKSet, errors, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose';

import type { Env } from './env';
import { USERNAME_CLAIM } from './exchange';

let remoteKeys: { issuer: string; keys: JWTVerifyGetKey } | undefined;

// Kept per issuer so jose's key cache and refetch cooldown carry across requests.
function auth0Keys(issuer: string): JWTVerifyGetKey {
  if (remoteKeys?.issuer !== issuer) {
    remoteKeys = { issuer, keys: createRemoteJWKSet(new URL('.well-known/jwks.json', issuer)) };
  }
  return remoteKeys.keys;
}

// Failing to fetch or read Auth0's key set is an outage, so it must not read as a bad token.
function isKeySetFailure(err: unknown): boolean {
  return (
    !(err instanceof errors.JOSEError) ||
    err.code === 'ERR_JOSE_GENERIC' ||
    err instanceof errors.JWKSTimeout ||
    err instanceof errors.JWKSInvalid ||
    err instanceof errors.JWKInvalid
  );
}

export function allowedClientIds(env: Env): string[] {
  return (env.JWT_CLIENT_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export async function verifyJwt(
  token: string,
  clientIds: string[],
  env: Env,
): Promise<string | null> {
  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(token, auth0Keys(env.M2M_ISSUER_URL), {
      issuer: env.M2M_ISSUER_URL,
      audience: env.INSIGHTS_API_AUDIENCE,
      algorithms: ['RS256'],
    }));
  } catch (err) {
    if (isKeySetFailure(err)) throw err;
    console.warn(`JWT rejected: ${(err as errors.JOSEError).code}`);
    return null;
  }

  const client = payload.client_id ?? payload.azp;
  if (typeof client !== 'string' || !clientIds.includes(client)) {
    console.warn(`JWT rejected: client ${String(client)} is not allowed`);
    return null;
  }
  const username = payload[USERNAME_CLAIM];
  return typeof username === 'string' && username !== '' ? username : null;
}
