// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import autoload from '@fastify/autoload';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import activityTypeRoutes from './activity-types.js';
import projectRoutes from './projects.js';

// Owns everything under /v1-alpha; the spec route is mounted by the registry loop in app.ts.
const v1AlphaRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  // Set before the handler runs, so error replies carry it too (see ADR-0013).
  scope.addHook('onRequest', async (_request, reply) => {
    reply.header('Cache-Control', 'private, max-age=0');
  });

  await scope.register(projectRoutes);
  await scope.register(activityTypeRoutes);
  for (const group of ['development', 'contributors', 'popularity', 'security', 'overview']) {
    const dir = fileURLToPath(new URL(`./${group}`, import.meta.url));
    // @fastify/autoload throws ENOENT for a missing folder, so a lost development/ fails startup.
    // Git and tsc drop empty folders, so the other groups are skipped until their first route lands.
    if (group === 'development' || existsSync(dir)) {
      await scope.register(autoload, { dir, dirNameRoutePrefix: false, forceESM: true });
    }
  }
};

export default v1AlphaRoutes;
