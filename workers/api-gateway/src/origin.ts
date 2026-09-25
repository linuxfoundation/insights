// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Entitlement } from './cache';
import type { Env } from './env';
import {
  CLIENT_IP_HEADER,
  ORG_HEADER,
  TIER_HEADER,
  TRUSTED_HEADERS,
  WORKER_SECRET_HEADER,
} from './headers';

export function buildOriginRequest(request: Request, env: Env, entitlement: Entitlement): Request {
  const incoming = new URL(request.url);
  const target = new URL(env.ORIGIN_URL);
  target.pathname = incoming.pathname;
  target.search = incoming.search;

  const headers = new Headers(request.headers);
  for (const name of TRUSTED_HEADERS) headers.delete(name);
  headers.set('authorization', `Bearer ${entitlement.accessToken}`);
  headers.set(WORKER_SECRET_HEADER, env.WORKER_SECRET);

  const clientIp = request.headers.get('cf-connecting-ip');
  if (clientIp) headers.set(CLIENT_IP_HEADER, clientIp);

  headers.set(ORG_HEADER, entitlement.orgTier.orgId);
  headers.set(TIER_HEADER, entitlement.orgTier.tier);

  return new Request(target, { method: request.method, headers, body: request.body });
}

export function callOrigin(request: Request): Promise<Response> {
  return fetch(request);
}
