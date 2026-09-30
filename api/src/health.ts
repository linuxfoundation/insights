// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsync } from 'fastify';

import { closeCmPool, isCmReachable } from './clients/postgres.js';

// Unversioned probe routes, reserved by ADR 0009 and kept out of the OpenAPI documents.
export const healthRoutes: FastifyPluginAsync = async (scope) => {
  scope.addHook('onClose', closeCmPool);

  scope.get('/health/live', { schema: { hide: true } }, async () => ({ status: 'ok' }));

  scope.get('/health/ready', { schema: { hide: true } }, async (_request, reply) => {
    const postgres = await isCmReachable();
    reply.code(postgres ? 200 : 503);
    return { status: postgres ? 'ok' : 'unavailable', postgres: postgres ? 'up' : 'down' };
  });
};
