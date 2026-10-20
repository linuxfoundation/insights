// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyRequest } from 'fastify';

// Set by the Worker for callers in a member organization and for its admin LFIDs (ADR-0006).
export const TIER_HEADER = 'x-tier';

export type Tier = 'basic' | 'premium';

// Every tier the Worker forwards is premium, and a caller it forwards without one is basic (ADR-0023).
export function tierOf(request: FastifyRequest): Tier {
  return request.headers[TIER_HEADER] ? 'premium' : 'basic';
}
