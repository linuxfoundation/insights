// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Static } from '@sinclair/typebox';
import tracer from 'dd-trace';
import type { FastifyRequest } from 'fastify';

import {
  createTinybirdClient,
  TinybirdClientError,
  TinybirdInvalidResponseError,
  TinybirdProjectNotFoundError,
  TinybirdQueueFullError,
  TinybirdQueueTimeoutError,
  TinybirdUnavailableError,
  type TinybirdClient,
  type TinybirdQuery,
} from '@lfx-insights/tinybird-client';

import { requiredEnv } from '../env.js';
import { UpstreamUnavailableError } from '../lib/errors.js';
import { type DateRange, toTinybirdRange } from '../lib/period.js';
import type { PipeTarget } from '../lib/widget-scope.js';
import { count, gauge, statusClass, timing } from '../metrics.js';
import type { ActivityFilterQuery } from '../schemas/common.js';
import { createInMemoryBucketCache } from './bucket-cache.js';

const bucketsPath = '/v0/pipes/project_buckets.json';

export type RequestLog = Pick<FastifyRequest, 'log'>;

let client: TinybirdClient | undefined;

// Errors already counted, so a failure shared by every caller of one bucket lookup counts once.
const countedErrors = new WeakSet<object>();

function alreadyCounted(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  return countedErrors.has(err) || alreadyCounted((err as { cause?: unknown }).cause);
}

function countError(path: string, err: unknown): void {
  count('tinybird.errors', { pipe: path, error_type: tinybirdErrorType(err) });
  if (typeof err === 'object' && err !== null) countedErrors.add(err);
}

export const tinybirdEnv = ['API_TB_TOKEN', 'API_TB_HOST'] as const;

// Built on first use, so importing this module never needs the API_TB_* variables.
export function getTinybirdClient(): TinybirdClient {
  if (!client) {
    client = createTinybirdClient({
      baseUrl: requiredEnv('API_TB_HOST'),
      token: requiredEnv('API_TB_TOKEN'),
      bucketCache: createInMemoryBucketCache(),
      // One span, duration sample and error count per request the client sends, queue wait and
      // retries inside, so a cached bucket adds nothing to the pipe's figures.
      wrapRequest: timedRequest,
      // Gauges in place of the client's status log line every 8 seconds.
      onQueueStatus: ({ active, queued, effectiveLimit }) => {
        gauge('concurrency', active, { state: 'active' });
        gauge('concurrency', queued, { state: 'queued' });
        gauge('concurrency', effectiveLimit, { state: 'limit' });
      },
    });
  }
  return client;
}

async function timedRequest<T>(
  path: string,
  params: TinybirdQuery,
  send: () => Promise<T>,
): Promise<T> {
  const started = performance.now();
  try {
    const result = await tracer.trace(
      'tinybird.query',
      {
        resource: path,
        tags:
          params.bucketId === undefined
            ? { pipe: path }
            : { pipe: path, bucket_id: params.bucketId },
      },
      send,
    );
    timing('tinybird.duration', performance.now() - started, { pipe: path, status_class: '2xx' });
    return result;
  } catch (err: unknown) {
    timing('tinybird.duration', performance.now() - started, {
      pipe: path,
      status_class: durationStatusClass(err),
    });
    countError(path, err);
    throw err;
  }
}

// Queue rejections and malformed bodies carry synthetic status codes. A rejected request never
// left the process and a body is parsed only after a 2xx, so neither is a Tinybird 5xx.
function durationStatusClass(err: unknown): string {
  if (err instanceof TinybirdQueueFullError || err instanceof TinybirdQueueTimeoutError) {
    return 'error';
  }
  if (err instanceof TinybirdInvalidResponseError) return '2xx';
  if (err instanceof TinybirdClientError) return statusClass(err.statusCode);
  return 'error';
}

function tinybirdErrorType(err: unknown): string {
  if (err instanceof TinybirdQueueFullError) return 'queue_full';
  if (err instanceof TinybirdQueueTimeoutError) return 'queue_timeout';
  if (err instanceof TinybirdInvalidResponseError) return 'invalid_response';
  if (err instanceof TinybirdProjectNotFoundError) return 'not_found';
  if (err instanceof TinybirdUnavailableError) return 'unavailable';
  if (err instanceof TinybirdClientError) return 'http';
  return 'network';
}

// Every Tinybird failure becomes a 503, logged once per pipe call with the pipe path, so
// Tinybird's own status never reaches the caller. Errors the request hook never saw are counted
// here, once each.
async function fromTinybird<T>(
  request: RequestLog,
  path: string,
  call: () => Promise<T>,
): Promise<T> {
  try {
    return await call();
  } catch (err: unknown) {
    if (!alreadyCounted(err)) {
      countError(path, err);
    }
    if (err instanceof TinybirdQueueFullError || err instanceof TinybirdQueueTimeoutError) {
      request.log.warn({ err }, `Tinybird ${path} request rejected by local queue`);
    } else {
      request.log.error({ err }, `Tinybird ${path} request failed`);
    }
    throw new UpstreamUnavailableError();
  }
}

// The client only checks that `data` is present, so off-contract rows or totals are rejected here
// and map to 503 with the other upstream faults. Tinybird can omit `total`.
function fetchGuarded<T>(
  request: RequestLog,
  path: string,
  params: TinybirdQuery,
  isRow: (row: T) => boolean,
  checkTotal: boolean,
  method: 'fetch' | 'post' = 'fetch',
): Promise<{ rows: T[]; total: number | undefined }> {
  // A missing API_TB_* variable throws here, outside the 503 mapping, so it stays a 500.
  const client = getTinybirdClient();
  return fromTinybird(request, path, async () => {
    const { data, rows_before_limit_at_least: total } = await client[method]<T[]>(path, params);
    if (!Array.isArray(data) || !data.every(isRow)) {
      throw new TinybirdInvalidResponseError('Tinybird returned rows of an unexpected shape');
    }
    if (checkTotal && total !== undefined && !(Number.isSafeInteger(total) && total >= 0)) {
      throw new TinybirdInvalidResponseError('Tinybird returned an unexpected row total');
    }
    return { rows: data, total };
  });
}

export function fetchCountedPipe<T>(
  request: RequestLog,
  path: string,
  params: TinybirdQuery,
  isRow: (row: T) => boolean,
): Promise<{ rows: T[]; total: number | undefined }> {
  return fetchGuarded(request, path, params, isRow, true);
}

// POST keeps unbounded id lists out of the URL, which upstream proxies cap in length.
export function postCountedPipe<T>(
  request: RequestLog,
  path: string,
  params: TinybirdQuery,
  isRow: (row: T) => boolean,
): Promise<{ rows: T[]; total: number | undefined }> {
  return fetchGuarded(request, path, params, isRow, true, 'post');
}

export async function fetchPipe<T>(
  request: RequestLog,
  path: string,
  params: TinybirdQuery,
  isRow: (row: T) => boolean = () => true,
): Promise<T[]> {
  return (await fetchGuarded(request, path, params, isRow, false)).rows;
}

// Ajv coerces a bare `repos=` into [''] and the client sends an empty array as `repos=`, which a
// pipe would apply as a filter matching nothing.
export function repoFilter(repos?: string[]): string[] | undefined {
  const kept = repos?.filter(Boolean);
  return kept?.length ? kept : undefined;
}

export function activityFilterParams(
  target: PipeTarget,
  query: Static<typeof ActivityFilterQuery>,
  current: DateRange,
): TinybirdQuery {
  return {
    ...target,
    repos: repoFilter(query.repos),
    ...toTinybirdRange(current),
    platform: query.platform,
    activity_type: query.activityType,
    includeCodeContributions: query.includeCodeContributions,
    includeCollaborations: query.includeCollaborations,
  };
}

// Null means Tinybird has no bucket for the slug: metric routes answer zeros without a pipe call,
// where the client alone would throw its own 404.
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
