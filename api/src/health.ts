// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsync } from 'fastify';

import { closeCmPool, cmDbEnv } from './clients/postgres.js';
import { tinybirdEnv } from './clients/tinybird.js';
import { missingEnv } from './env.js';

// ADR 0009 probes. Readiness checks only this pod's config, since an upstream outage hits every
// pod at once; routes answer 503 for their own upstream instead.
export const healthRoutes: FastifyPluginAsync = async (scope) => {
  scope.addHook('onClose', closeCmPool);

  scope.get('/health/live', { schema: { hide: true } }, async () => ({ status: 'ok' }));

  scope.get('/health/ready', { schema: { hide: true } }, async (_request, reply) => {
    const missing = missingEnv([...cmDbEnv, ...tinybirdEnv]);
    if (missing.length > 0) {
      reply.code(503);
      return { status: 'unavailable', missingConfig: missing };
    }
    return { status: 'ok' };
  });
};
