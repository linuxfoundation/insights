// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import tracer from 'dd-trace';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { tierOf } from './tier.js';

export const REQUESTS_METRIC = 'insights.api.requests';

// Registered between authenticate and rateLimit, so a rate-limited request still names its caller.
// setUser tags the trace's root span with usr.id and usr.tier.
export async function tagCaller(request: FastifyRequest): Promise<void> {
  if (request.username !== null) {
    tracer.setUser({ id: request.username, tier: tierOf(request) });
  }
}

// Each LFID adds its own series per route and status, which is affordable at alpha traffic.
// tracer.dogstatsd is read per call because init() replaces the no-op client.
export async function countRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (request.username === null) {
    return;
  }
  tracer.dogstatsd.increment(REQUESTS_METRIC, 1, {
    'http.route': request.routeOptions.url ?? 'unmatched',
    'http.status_code': reply.statusCode,
    'usr.id': request.username,
    'usr.tier': tierOf(request),
  });
}
