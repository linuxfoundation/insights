// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import {
  createTinybirdClient,
  TinybirdClientError,
  type TinybirdResponse,
  BucketCacheStorage,
} from '@lfx-insights/tinybird-client';
import { getBucketIdForCollection, getBucketIdForProject } from './bucket-cache';

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

export const client = createTinybirdClient({
  baseUrl: process.env.NUXT_TINYBIRD_BASE_URL ?? 'https://api.us-west-2.aws.tinybird.co',
  token: process.env.NUXT_TINYBIRD_TOKEN!,
  maxConcurrent: parseInt(process.env.NUXT_TINYBIRD_MAX_CONCURRENT ?? '35', 10),
  maxQueueSize: parseInt(process.env.NUXT_TINYBIRD_MAX_QUEUE_SIZE ?? '500', 10),
  queueTimeoutMs: parseInt(process.env.NUXT_TINYBIRD_QUEUE_TIMEOUT_MS ?? '10000', 10),
  slowRequestThresholdMs: parseInt(
    process.env.NUXT_TINYBIRD_SLOW_REQUEST_THRESHOLD_MS ?? '5000',
    10,
  ),
  bucketCache: createNitroRedisAdapter(),
});

type DateTimeOrPrimitive =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | DateTime
  | undefined
  | null;

function serializeQuery(
  query: Record<string, DateTimeOrPrimitive>,
): Record<string, string | number | boolean | string[] | number[] | undefined | null> {
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
  const tinybirdBaseUrl =
    process.env.NUXT_TINYBIRD_BASE_URL || 'https://api.us-west-2.aws.tinybird.co';
  const tinybirdToken = process.env.NUXT_TINYBIRD_TOKEN;

  if (!tinybirdBaseUrl) {
    throw new Error('Tinybird base URL is not defined');
  }
  if (!tinybirdToken) {
    throw new Error('Tinybird token is not defined');
  }

  // Fetch and add bucketId if query contains a project parameter
  // Tinybird will route the request to the correct bucket that contains the data for that project
  if (
    query.project &&
    typeof query.project === 'string' &&
    !query.bucketId &&
    path !== '/v0/pipes/project_buckets.json'
  ) {
    try {
      const bucketId = await getBucketIdForProject(query.project, fetchFromTinybird);
      if (bucketId !== null) {
        query.bucketId = bucketId;
      } else {
        throw createError({
          statusCode: 404,
          statusMessage: `Project not found: ${query.project}`,
        });
      }
    } catch (error: unknown) {
      // Re-throw 404 and 429 errors
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const status = (error as { statusCode: number }).statusCode;
        if (status === 404 || status === 429 || status >= 500) {
          throw error;
        }
      }
      console.warn(`Failed to fetch bucketId for project ${query.project}:`, error);
      // Continue without bucketId for other errors
    }
  }

  // Fetch and add bucketId if query contains a collectionSlug parameter
  // Tinybird will route the request to the single bucket that contains the collection's data
  // instead of scanning the 10-way union
  if (
    query.collectionSlug &&
    typeof query.collectionSlug === 'string' &&
    !query.bucketId &&
    path !== '/v0/pipes/collection_buckets.json'
  ) {
    try {
      const bucketId = await getBucketIdForCollection(query.collectionSlug, fetchFromTinybird);
      if (bucketId !== null) {
        query.bucketId = bucketId;
      }
      // No bucketId found is not fatal for collections (unlike projects) - fall back to the union pipe
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const status = (error as { statusCode: number }).statusCode;
        if (status === 429 || status >= 500) {
          throw error;
        }
      }
      console.warn(`Failed to fetch bucketId for collection ${query.collectionSlug}:`, error);
      // Continue without bucketId - falls back to the union pipe
    }
  }

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
