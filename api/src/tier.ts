// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyRequest } from 'fastify';

import { TierForbiddenError } from './lib/errors.js';

// Set by the Worker for callers in a member organization and for its admin LFIDs (ADR-0006).
export const TIER_HEADER = 'x-tier';

export type Tier = 'basic' | 'premium';

// Every tier the Worker forwards is premium, and a caller it forwards without one is basic (ADR-0023).
export function tierOf(request: FastifyRequest): Tier {
  return request.headers[TIER_HEADER] ? 'premium' : 'basic';
}

// Skipped while auth is disabled for local development, as the rate limit is.
export async function premiumOnly(request: FastifyRequest): Promise<void> {
  if (request.username !== null && tierOf(request) !== 'premium') {
    throw new TierForbiddenError();
  }
}
