// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyRequest } from 'fastify';
import {
  createTinybirdClient,
  TinybirdInvalidResponseError,
  type TinybirdClient,
  type TinybirdQuery,
} from '@lfx-insights/tinybird-client';
import { UpstreamUnavailableError } from '../lib/errors.js';
import { createInMemoryBucketCache } from './bucket-cache.js';

const bucketsPath = '/v0/pipes/project_buckets.json';

// Only the logger is used, so a route's typed request and a test double both fit.
type RequestLog = Pick<FastifyRequest, 'log'>;

let client: TinybirdClient | undefined;

/**
 * Lazily constructs the Tinybird client on first use so importing this module
 * never fails (e.g. in tests or tooling that don't touch Tinybird); env
 * validation only happens once the client is actually needed.
 */
export function getTinybirdClient(): TinybirdClient {
  if (!client) {
    const token = process.env.API_TB_TOKEN;
    if (!token) {
      throw new Error('API_TB_TOKEN environment variable is required');
    }
    const baseUrl = process.env.API_TB_HOST;
    if (!baseUrl) {
      throw new Error('API_TB_HOST environment variable is required');
    }
    client = createTinybirdClient({ baseUrl, token, bucketCache: createInMemoryBucketCache() });
  }
  return client;
}

// Every Tinybird failure becomes a 503, logged once per pipe call with the pipe path, so
// Tinybird's own status never reaches the caller.
async function fromTinybird<T>(
  request: RequestLog,
  path: string,
  call: () => Promise<T>,
): Promise<T> {
  try {
    return await call();
  } catch (err: unknown) {
    request.log.error({ err }, `Tinybird ${path} request failed`);
    throw new UpstreamUnavailableError();
  }
}

// The client only checks that `data` is present, so a pipe answering outside its contract is
// rejected here and maps to 503 with the other upstream faults.
export function fetchPipe<T>(
  request: RequestLog,
  path: string,
  params: TinybirdQuery,
  isRow: (row: T) => boolean = () => true,
): Promise<T[]> {
  // A missing API_TB_* variable throws here, outside the 503 mapping, so it stays a 500.
  const client = getTinybirdClient();
  return fromTinybird(request, path, async () => {
    const { data } = await client.fetch<T[]>(path, params);
    if (!Array.isArray(data) || !data.every(isRow)) {
      throw new TinybirdInvalidResponseError('Tinybird returned rows of an unexpected shape');
    }
    return data;
  });
}

// Ajv coerces a bare `repos=` into [''] and the client sends an empty array as `repos=`, which a
// pipe would apply as a filter matching nothing. The Nuxt handlers drop the empty value too.
export function repoFilter(repos?: string[]): string[] | undefined {
  const kept = repos?.filter(Boolean);
  return kept?.length ? kept : undefined;
}

// Null means Tinybird has no bucket for the slug: metric routes answer zeros without a pipe call,
// where the client alone would throw its own 404. Resolving here also spares it a lookup per call.
export async function withBucket<T>(
  request: RequestLog,
  slug: string,
  query: (bucketId: number) => Promise<T>,
): Promise<T | null> {
  const client = getTinybirdClient();
  const bucketId = await fromTinybird(request, bucketsPath, () =>
    client.getBucketIdForProject(slug),
  );
  return bucketId === null ? null : query(bucketId);
}
