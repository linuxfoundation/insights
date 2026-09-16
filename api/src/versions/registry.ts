// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import v1Routes from './v1/index.js';

export interface ApiVersion {
  prefix: string;
  plugin: FastifyPluginAsyncTypebox;
}

export const versionRegistry: ApiVersion[] = [{ prefix: '/v1', plugin: v1Routes }];
