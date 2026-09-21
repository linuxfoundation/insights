// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import projectRoutes from './projects.js';
import issuesResolutionRoutes from './development/issues-resolution.js';

// Owns everything under /v1-alpha; the spec route is mounted by the registry loop in app.ts.
const v1AlphaRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  // Set before the handler runs, so error replies carry it too (see ADR-0013).
  scope.addHook('onRequest', async (_request, reply) => {
    reply.header('Cache-Control', 'private, max-age=0');
  });

  await scope.register(projectRoutes);
  await scope.register(issuesResolutionRoutes);
};

export default v1AlphaRoutes;
