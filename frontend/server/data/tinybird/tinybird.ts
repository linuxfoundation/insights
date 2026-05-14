// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import {
  createTinybirdClient,
  TinybirdClientError,
  type TinybirdResponse,
} from '@lfx-insights/tinybird-client';
import type { BucketCacheStorage } from '@lfx-insights/tinybird-client';

// Re-export for callers that reference TinybirdResponse directly from this module
export type { TinybirdResponse };

function createNitroRedisAdapter(): BucketCacheStorage | undefined {
  if (!process.env.NUXT_REDIS_URL) return undefined;
  return {
    async getItem(key: string) {
      return useStorage('redis').getItem<number>(key);
    },
    async setItem(key: string, value: number, options?: { ttl?: number }) {
      await useStorage('redis').setItem(key, value, options);
    },
    async removeItem(key: string) {
      await useStorage('redis').removeItem(key);
    },
    async getKeys(prefix: string) {
      return useStorage('redis').getKeys(prefix);
    },
  };
}

const client = createTinybirdClient({
  baseUrl: process.env.NUXT_TINYBIRD_BASE_URL ?? 'https://api.us-west-2.aws.tinybird.co',
  token: process.env.NUXT_TINYBIRD_TOKEN ?? '',
  maxConcurrent: parseInt(process.env.NUXT_TINYBIRD_MAX_CONCURRENT ?? '35', 10),
  maxQueueSize: parseInt(process.env.NUXT_TINYBIRD_MAX_QUEUE_SIZE ?? '500', 10),
  queueTimeoutMs: parseInt(process.env.NUXT_TINYBIRD_QUEUE_TIMEOUT_MS ?? '10000', 10),
  slowRequestThresholdMs: parseInt(
    process.env.NUXT_TINYBIRD_SLOW_REQUEST_THRESHOLD_MS ?? '5000',
    10,
  ),
  bucketCache: createNitroRedisAdapter(),
});

type DateTimeOrPrimitive = string | number | boolean | string[] | DateTime | undefined | null;

function serializeQuery(
  query: Record<string, DateTimeOrPrimitive>,
): Record<string, string | number | boolean | string[] | undefined | null> {
  return Object.fromEntries(
    Object.entries(query).map(([k, v]) => [
      k,
      v instanceof DateTime ? (v.toFormat('yyyy-MM-dd 00:00:00') ?? '') : v,
    ]),
  );
}

function toH3Error(err: unknown): never {
  if (err instanceof TinybirdClientError) {
    throw createError({ statusCode: err.statusCode, statusMessage: err.message });
  }
  throw err;
}

export async function fetchFromTinybird<T>(
  path: string,
  query: Record<string, DateTimeOrPrimitive>,
): Promise<TinybirdResponse<T>> {
  try {
    return await client.fetch<T>(path, serializeQuery(query));
  } catch (e) {
    toH3Error(e);
  }
}

export async function postToTinybird<T>(
  path: string,
  params: Record<string, DateTimeOrPrimitive>,
): Promise<TinybirdResponse<T>> {
  try {
    return await client.post<T>(path, serializeQuery(params));
  } catch (e) {
    toH3Error(e);
  }
}

export async function addDataToTinybirdDatasource(
  datasource: string,
  data: object,
): Promise<boolean> {
  try {
    return await client.ingest(datasource, data);
  } catch (e) {
    toH3Error(e);
  }
}
