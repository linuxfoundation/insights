// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  edgeCache,
  ENTITLEMENT_TTL_SECONDS,
  type Entitlement,
  type EntitlementCache,
} from './cache';
import type { Env } from './env';
import { exchangePat, usernameFromJwt } from './exchange';
import { ADMIN_ORG_TIER, fetchAdminUsernames } from './flags';
import { allowedClientIds, verifyJwt } from './jwt';
import { buildOriginRequest, callOrigin } from './origin';
import { hashPat, isPat, readBearer } from './pat';
import { fetchMemberTiers, pickOrgTier, type OrgTier } from './tiers';

// Keeps a username's cache key apart from every PAT's, since a PAT always starts with lfi_.
const USERNAME_KEY_PREFIX = 'username:';

export interface Deps {
  cache: EntitlementCache;
  exchangePat: typeof exchangePat;
  fetchAdminUsernames: typeof fetchAdminUsernames;
  fetchMemberTiers: typeof fetchMemberTiers;
  callOrigin: typeof callOrigin;
}

export async function handle(request: Request, env: Env, deps: Deps): Promise<Response> {
  if (isHealthPath(new URL(request.url).pathname)) return notFound();

  const token = readBearer(request);
  if (!token) return unauthorized();
  if (!isPat(token)) return handleJwt(request, token, env, deps);

  const key = await hashPat(token, env.PAT_HASH_SALT);
  let entitlement = await deps.cache.get(key);
  if (!entitlement) {
    const exchanged = await deps.exchangePat(token, request.headers.get('cf-connecting-ip'), env);
    if (!exchanged) return unauthorized();
    const username = usernameFromJwt(exchanged.access_token);
    if (!username) return unauthorized();

    const orgTier = await resolveOrgTier(username, env, deps);
    entitlement = { accessToken: exchanged.access_token, orgTier } satisfies Entitlement;
    await deps.cache.put(key, entitlement, Math.min(exchanged.expires_in, ENTITLEMENT_TTL_SECONDS));
  }

  return deps.callOrigin(buildOriginRequest(request, env, entitlement), env);
}

async function handleJwt(request: Request, token: string, env: Env, deps: Deps): Promise<Response> {
  const clientIds = allowedClientIds(env);
  if (clientIds.length === 0) return unauthorized();
  const username = await verifyJwt(token, clientIds, env);
  if (!username) return unauthorized();

  const key = await hashPat(`${USERNAME_KEY_PREFIX}${username}`, env.PAT_HASH_SALT);
  const cached = await deps.cache.get(key);
  const orgTier = cached ? cached.orgTier : await resolveOrgTier(username, env, deps);
  // The entry keeps only the tier, since each request forwards its own token.
  if (!cached) await deps.cache.put(key, { accessToken: '', orgTier }, ENTITLEMENT_TTL_SECONDS);

  return deps.callOrigin(buildOriginRequest(request, env, { accessToken: token, orgTier }), env);
}

async function resolveOrgTier(username: string, env: Env, deps: Deps): Promise<OrgTier | null> {
  const admins = await deps.fetchAdminUsernames(env);
  return admins.includes(username)
    ? ADMIN_ORG_TIER
    : pickOrgTier(await deps.fetchMemberTiers(username, env));
}

function isHealthPath(pathname: string): boolean {
  return pathname === '/health' || pathname.startsWith('/health/');
}

function notFound(): Response {
  const body = {
    statusCode: 404,
    code: 'not_found',
    error: 'Not Found',
    message: 'Route not found',
  };
  return Response.json(body, { status: 404 });
}

function unauthorized(): Response {
  const body = {
    statusCode: 401,
    code: 'unauthorized',
    error: 'Unauthorized',
    message: 'A valid personal access token or LFX access token is required',
  };
  return Response.json(body, { status: 401, headers: { 'www-authenticate': 'Bearer' } });
}

export default {
  fetch(request, env) {
    return handle(request, env, {
      cache: edgeCache(),
      exchangePat,
      fetchAdminUsernames,
      fetchMemberTiers,
      callOrigin,
    });
  },
} satisfies ExportedHandler<Env>;
