// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import tracer from 'dd-trace';
import type { FastifyRequest } from 'fastify';

import { tierOf } from './tier.js';

// Registered between authenticate and rateLimit, so a rate-limited request still names its caller.
// setUser tags the trace's root span with usr.id and usr.tier.
export async function tagCaller(request: FastifyRequest): Promise<void> {
  if (request.username !== null) {
    tracer.setUser({ id: request.username, tier: tierOf(request) });
  }
}
