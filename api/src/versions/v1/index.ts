// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

// Owns everything under /v1; the spec route is mounted by the registry loop in app.ts.
const v1Routes: FastifyPluginAsyncTypebox = async () => {};

export default v1Routes;
