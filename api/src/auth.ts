// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyReply, FastifyRequest } from 'fastify';
import { createRemoteJWKSet, errors, jwtVerify, type JWTVerifyGetKey } from 'jose';

import { requiredEnv } from './env.js';
import { UnauthorizedError, UpstreamUnavailableError } from './lib/errors.js';

// The issuer is the token's exact `iss`, trailing slash included; its key set sits under it.
export const authEnv = ['API_AUTH0_ISSUER_URL', 'API_AUTH0_AUDIENCE'] as const;

export const USERNAME_CLAIM = 'http://lfx.dev/claims/username';

declare module 'fastify' {
  interface FastifyRequest {
    // The caller's LFID from the verified access token; null while auth is disabled.
    username: string | null;
  }
}

export const authDisabled = () => process.env.API_AUTH_DISABLED === 'true';

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

function unauthorized(reply: FastifyReply): never {
  reply.header('www-authenticate', 'Bearer');
  throw new UnauthorizedError();
}

// Verifies the Auth0 access token the Worker forwards (ADR-0006). `keys` replaces Auth0's key set in tests.
export function authenticate(keys?: JWTVerifyGetKey) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (authDisabled()) {
      return;
    }
    const token = /^Bearer (\S+)$/i.exec(request.headers.authorization ?? '')?.[1];
    if (!token) {
      unauthorized(reply);
    }

    let username: unknown;
    try {
      const issuer = requiredEnv('API_AUTH0_ISSUER_URL');
      const { payload } = await jwtVerify(token, keys ?? auth0Keys(issuer), {
        issuer,
        audience: requiredEnv('API_AUTH0_AUDIENCE'),
        algorithms: ['RS256'],
      });
      username = payload[USERNAME_CLAIM];
    } catch (err: unknown) {
      if (isKeySetFailure(err)) {
        request.log.error({ err }, 'Access token verification unavailable');
        throw new UpstreamUnavailableError();
      }
      request.log.warn({ reason: (err as errors.JOSEError).code }, 'Access token rejected');
      unauthorized(reply);
    }

    if (typeof username !== 'string' || username === '') {
      request.log.warn({ reason: 'missing username claim' }, 'Access token rejected');
      unauthorized(reply);
    }
    request.username = username;
  };
}
