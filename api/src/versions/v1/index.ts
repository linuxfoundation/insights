// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

// Owns everything under /v1; inherits the root swagger decoration.
const v1Routes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/openapi.json', async () => app.swagger());
};

export default v1Routes;
