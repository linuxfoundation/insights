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
import { buildOriginRequest, callOrigin } from './origin';
import { hashPat, readPat } from './pat';
import { fetchMemberTiers, pickOrgTier } from './tiers';

export interface Deps {
  cache: EntitlementCache;
  exchangePat: typeof exchangePat;
  fetchMemberTiers: typeof fetchMemberTiers;
  callOrigin: typeof callOrigin;
}

export async function handle(request: Request, env: Env, deps: Deps): Promise<Response> {
  const pat = readPat(request);
  if (!pat) return unauthorized();

  const key = await hashPat(pat, env.PAT_HASH_SALT);
  let entitlement = await deps.cache.get(key);
  if (!entitlement) {
    const exchanged = await deps.exchangePat(pat);
    const username = usernameFromJwt(exchanged.access_token);
    if (!username) return unauthorized();

    entitlement = {
      accessToken: exchanged.access_token,
      orgTier: pickOrgTier(await deps.fetchMemberTiers(username, env)),
    } satisfies Entitlement;
    await deps.cache.put(key, entitlement, Math.min(exchanged.expires_in, ENTITLEMENT_TTL_SECONDS));
  }

  return deps.callOrigin(buildOriginRequest(request, env, entitlement));
}

function unauthorized(): Response {
  const body = {
    statusCode: 401,
    code: 'unauthorized',
    error: 'Unauthorized',
    message: 'A valid personal access token is required',
  };
  return Response.json(body, { status: 401, headers: { 'www-authenticate': 'Bearer' } });
}

export default {
  fetch(request, env) {
    return handle(request, env, {
      cache: edgeCache(),
      exchangePat,
      fetchMemberTiers,
      callOrigin,
    });
  },
} satisfies ExportedHandler<Env>;
