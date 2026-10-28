// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import tracer from 'dd-trace';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { count, statusClass, timing } from './metrics.js';
import { tierOf } from './tier.js';

// Registered between authenticate and rateLimit, so a rate-limited request still names its caller.
// setUser tags the trace's root span with usr.id and usr.tier.
export async function tagCaller(request: FastifyRequest): Promise<void> {
  if (request.username !== null) {
    tracer.setUser({ id: request.username, tier: tierOf(request) });
  }
}

// Tagged by route template and its version prefix, so each endpoint is one series per status class
// and tier. A request without a verified caller has tier `none`.
export async function recordRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const endpoint = request.routeOptions.url ?? 'unmatched';
  const tags = {
    endpoint,
    version: endpoint.split('/')[1] ?? 'none',
    status_class: statusClass(reply.statusCode),
    tier: request.username === null ? 'none' : tierOf(request),
  };
  count('request.count', tags);
  timing('request.duration', reply.elapsedTime, tags);
}
