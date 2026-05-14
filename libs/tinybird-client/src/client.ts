// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { AdaptiveSemaphore } from './adaptive-semaphore.js';
import { createBucketCache } from './bucket-cache.js';
import {
  TinybirdClientError,
  TinybirdInvalidResponseError,
  TinybirdProjectNotFoundError,
} from './errors.js';
import type {
  TinybirdClient,
  TinybirdClientConfig,
  TinybirdLogger,
  TinybirdQuery,
  TinybirdQueryValue,
  TinybirdResponse,
} from './types.js';

const DEFAULT_BASE_URL = 'https://api.us-west-2.aws.tinybird.co';
const DEFAULT_MAX_CONCURRENT = 35;
const DEFAULT_MAX_QUEUE_SIZE = 500;
const DEFAULT_QUEUE_TIMEOUT_MS = 10_000;
const DEFAULT_SLOW_REQUEST_THRESHOLD_MS = 5_000;

/** Paths that bypass the semaphore so they don't compete with real data queries. */
const SKIP_THROTTLE_PATHS = new Set(['/v0/pipes/ping.json', '/v0/pipes/project_buckets.json']);

function buildQueryString(query: TinybirdQuery): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '' || Number.isNaN(value)) continue;
    if (Array.isArray(value)) {
      // Arrays use raw commas (not URL-encoded) for Tinybird Array() parameters
      parts.push(
        `${encodeURIComponent(key)}=${value.map((v) => encodeURIComponent(String(v))).join(',')}`,
      );
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.join('&');
}

function buildBodyString(params: TinybirdQuery): string {
  return buildQueryString(params);
}

async function parseResponse<T>(response: Response): Promise<TinybirdResponse<T>> {
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const detail = body ? ` — ${body.slice(0, 300)}` : '';
    throw new TinybirdClientError(
      response.status,
      `Tinybird request failed: ${response.statusText}${detail}`,
    );
  }
  const data = (await response.json()) as TinybirdResponse<T>;
  if (!data || !data.data) {
    throw new TinybirdInvalidResponseError();
  }
  return data;
}

export function createTinybirdClient(config: TinybirdClientConfig): TinybirdClient {
  if (!config.token) {
    throw new Error('createTinybirdClient: token is required');
  }

  const {
    baseUrl = DEFAULT_BASE_URL,
    token,
    maxConcurrent = DEFAULT_MAX_CONCURRENT,
    maxQueueSize = DEFAULT_MAX_QUEUE_SIZE,
    queueTimeoutMs = DEFAULT_QUEUE_TIMEOUT_MS,
    slowRequestThresholdMs = DEFAULT_SLOW_REQUEST_THRESHOLD_MS,
    bucketCache: bucketCacheStorage,
  } = config;

  const logger: TinybirdLogger = config.logger ?? console;
  const semaphore = new AdaptiveSemaphore(maxConcurrent, maxQueueSize, logger);
  const bucketCache = createBucketCache(bucketCacheStorage, logger);

  const authHeaders = { Authorization: `Bearer ${token}` };

  async function fetchFromTinybird<T>(path: string, query: TinybirdQuery): Promise<TinybirdResponse<T>> {
    // Resolve bucket routing for project queries
    if (
      query.project &&
      typeof query.project === 'string' &&
      !query.bucketId &&
      path !== '/v0/pipes/project_buckets.json'
    ) {
      try {
        const bucketId = await bucketCache.getBucketIdForProject(
          query.project as string,
          fetchFromTinybird,
        );
        if (bucketId !== null) {
          query = { ...query, bucketId };
        } else {
          throw new TinybirdProjectNotFoundError(query.project as string);
        }
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const status = (error as { statusCode: number }).statusCode;
          if (status === 404 || status === 429 || status >= 500) throw error;
        }
        logger.warn(`Failed to fetch bucketId for project ${query.project as string}: ${error}`);
      }
    }

    const qs = buildQueryString(query);
    const url = qs ? `${baseUrl}${path}?${qs}` : `${baseUrl}${path}`;
    const skipThrottle = SKIP_THROTTLE_PATHS.has(path);

    let acquired = false;
    let wasQueued = false;
    const fetchStart = Date.now();

    try {
      if (!skipThrottle) {
        wasQueued = await semaphore.acquire(queueTimeoutMs);
        acquired = true;
      }

      const response = await fetch(url, { headers: authHeaders });
      const data = await parseResponse<T>(response);

      const durationMs = Date.now() - fetchStart;
      if (durationMs > slowRequestThresholdMs) {
        logger.warn(
          JSON.stringify({
            message: 'tinybird_slow_request',
            pipe: path,
            params: query,
            durationMs,
            wasQueued,
            active: semaphore.getActive(),
            queued: semaphore.getQueueLength(),
            timestamp: new Date().toISOString(),
          }),
        );
      }

      return data;
    } catch (error: unknown) {
      const status =
        error && typeof error === 'object' && 'statusCode' in error
          ? (error as { statusCode: number }).statusCode
          : undefined;

      logger.error(
        JSON.stringify({
          message: 'tinybird_request_error',
          pipe: path,
          params: query,
          status,
          durationMs: Date.now() - fetchStart,
          wasQueued,
          active: semaphore.getActive(),
          queued: semaphore.getQueueLength(),
          timestamp: new Date().toISOString(),
        }),
      );

      if (status === 429) {
        semaphore.reportTinybirdRateLimit();
      }
      throw error;
    } finally {
      if (acquired) {
        semaphore.release();
      }
    }
  }

  async function postToTinybird<T>(path: string, params: TinybirdQuery): Promise<TinybirdResponse<T>> {
    const url = `${baseUrl}${path}`;
    const body = buildBodyString(params);
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    return parseResponse<T>(response);
  }

  async function ingest(datasource: string, data: object): Promise<boolean> {
    const url = `${baseUrl}/v0/events?name=${encodeURIComponent(datasource)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new TinybirdClientError(response.status, `Tinybird ingest failed: ${response.statusText}`);
    }
    return true;
  }

  return {
    fetch: fetchFromTinybird,
    post: postToTinybird,
    ingest,
    getBucketIdForProject: (project: string) =>
      bucketCache.getBucketIdForProject(project, fetchFromTinybird),
    clearBucketCache: bucketCache.clearBucketCache,
    clearAllBucketCaches: bucketCache.clearAllBucketCaches,
  };
}

export type { TinybirdQueryValue };
