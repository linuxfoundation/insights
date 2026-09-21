// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fileURLToPath } from 'node:url';
import autoload from '@fastify/autoload';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import projectRoutes from './projects.js';

// Owns everything under /v1-alpha; the spec route is mounted by the registry loop in app.ts.
const v1AlphaRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  // Set before the handler runs, so error replies carry it too (see ADR-0013).
  scope.addHook('onRequest', async (_request, reply) => {
    reply.header('Cache-Control', 'private, max-age=0');
  });

  await scope.register(projectRoutes);
  // Each module under development/ registers its own route, so an endpoint PR adds one file and
  // never edits this list. Route paths are absolute, hence no directory prefix.
  await scope.register(autoload, {
    dir: fileURLToPath(new URL('./development', import.meta.url)),
    dirNameRoutePrefix: false,
    forceESM: true,
  });
};

export default v1AlphaRoutes;
