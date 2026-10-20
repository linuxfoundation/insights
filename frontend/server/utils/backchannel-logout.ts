// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { jwtVerify, type JWTVerifyGetKey } from 'jose';

import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';

export const BACKCHANNEL_LOGOUT_EVENT = 'http://schemas.openid.net/event/backchannel-logout';

// Matches the refresh cookie lifetime, so every cookie that could carry a revoked sid expires first.
const REVOCATION_TTL_SECONDS = 60 * 60 * 24 * 30;

const revokedSidKey = (sid: string) => `auth:revoked_sid:${sid}`;
const revokedSubKey = (sub: string) => `auth:revoked_sub:${sub}`;

export interface LogoutClaims {
  sid?: string;
  sub?: string;
}

// Validation per OpenID Connect Back-Channel Logout 1.0, section 2.6.
export async function verifyLogoutToken(
  token: string,
  keys: JWTVerifyGetKey,
  expected: { issuer: string; audience: string },
): Promise<LogoutClaims> {
  const { payload } = await jwtVerify(token, keys, {
    ...expected,
    algorithms: ['RS256'],
    requiredClaims: ['iat'],
    maxTokenAge: '5 minutes',
    clockTolerance: '30 seconds',
  });

  const events = payload.events as Record<string, unknown> | undefined;
  if (typeof events !== 'object' || events === null || !(BACKCHANNEL_LOGOUT_EVENT in events)) {
    throw new Error('logout_token is missing the back-channel logout event');
  }
  if ('nonce' in payload) {
    throw new Error('logout_token must not contain a nonce');
  }
  const sid = typeof payload.sid === 'string' ? payload.sid : undefined;
  if (!sid && !payload.sub) {
    throw new Error('logout_token has neither sid nor sub');
  }

  return { sid, sub: payload.sub };
}

export async function revokeSession({ sid, sub }: LogoutClaims): Promise<void> {
  const loggedOutAt = Math.floor(Date.now() / 1000);
  const key = sid ? revokedSidKey(sid) : revokedSubKey(sub!);
  await useStorage('redis').setItem(key, loggedOutAt, { ttl: REVOCATION_TTL_SECONDS });
}

export async function isSessionRevoked(
  token: Pick<DecodedOidcToken, 'sid' | 'sub' | 'iat'>,
): Promise<boolean> {
  if (!useRuntimeConfig().redisUrl) {
    return false;
  }

  try {
    const keys = [revokedSubKey(token.sub), ...(token.sid ? [revokedSidKey(token.sid)] : [])];
    const [subLogout, sidLogout] = await useStorage('redis').getItems(keys);
    return sidLogout?.value != null || Number(subLogout?.value ?? 0) >= token.iat;
  } catch (error) {
    // Fail open: a Redis outage should not sign every user out.
    console.error('Session revocation lookup failed:', error);
    return false;
  }
}
