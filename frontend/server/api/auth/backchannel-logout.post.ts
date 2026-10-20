// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';
import { discovery } from 'openid-client';

import { revokeSession, verifyLogoutToken } from '../../utils/backchannel-logout';

// Cached so unauthenticated calls to this rate-limit-exempt route never trigger an Auth0 fetch.
let verifierConfig: Promise<{ issuer: string; keys: JWTVerifyGetKey }> | undefined;

const getVerifierConfig = () => {
  const config = useRuntimeConfig();
  verifierConfig ??= discovery(
    new URL(`https://${config.public.auth0Domain}`),
    config.public.auth0ClientId,
  ).then((auth0) => {
    const { issuer, jwks_uri } = auth0.serverMetadata();
    return { issuer, keys: createRemoteJWKSet(new URL(jwks_uri!)) };
  });
  verifierConfig.catch(() => {
    verifierConfig = undefined;
  });
  return verifierConfig;
};

// Auth0 calls this when an LF SSO session ends, so the matching Insights session can be dropped.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  setResponseHeader(event, 'cache-control', 'no-store');

  const body = await readBody<{ logout_token?: unknown }>(event).catch(() => undefined);
  const logoutToken = body?.logout_token;
  if (typeof logoutToken !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing logout_token' });
  }

  const { issuer, keys } = await getVerifierConfig();
  let claims;
  try {
    claims = await verifyLogoutToken(logoutToken, keys, {
      issuer,
      audience: config.public.auth0ClientId,
    });
  } catch (error) {
    console.warn('Rejected back-channel logout token:', (error as Error).message);
    throw createError({ statusCode: 400, statusMessage: 'Invalid logout_token' });
  }

  if (!config.redisUrl) {
    console.error('Back-channel logout received but Redis is not configured');
    throw createError({ statusCode: 503, statusMessage: 'Session store unavailable' });
  }

  await revokeSession(claims);
  return '';
});
