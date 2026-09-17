// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import v1Routes from './v1/index.js';

export interface ApiVersion {
  prefix: string;
  plugin: FastifyPluginAsyncTypebox;
}

export const versionRegistry: ApiVersion[] = [{ prefix: '/v1', plugin: v1Routes }];

const prefixPattern = /^\/v(\d+)(?:-(.+))?$/;

// Maps a URL prefix (e.g. '/v1-alpha') to the spec's semver-ish info.version
// (e.g. '1.0.0-alpha'), since the two identifiers are allowed to diverge.
export function specVersionFor(prefix: string): string {
  const match = prefixPattern.exec(prefix);
  if (!match) {
    return prefix;
  }
  const [, major, suffix] = match;
  return suffix ? `${major}.0.0-${suffix}` : `${major}.0.0`;
}
