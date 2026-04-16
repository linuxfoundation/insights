// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { ofetch } from 'ofetch';
import { getBucketIdForProject } from './bucket-cache';

/**
 * Concurrency limiter for outbound Tinybird GET requests.
 *
 * Caps the number of in-flight requests to `limit` (default 20, configurable via
 * NUXT_TINYBIRD_MAX_CONCURRENT). Excess requests queue with a timeout, returning 503
 * if they wait too long.
 *
 * Includes an adaptive backoff mechanism: when Tinybird returns a 429, the effective
 * concurrency limit is halved for 30 seconds to reduce pressure, then auto-recovers.
 */
class AdaptiveSemaphore {
  private count = 0;
  private effectiveLimit: number;
  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly recoveryMs = 30_000;
  private readonly backoffFactor = 0.5;
  private readonly minLimit = 5;
  private queue: Array<{
    resolve: () => void;
    reject: (err: unknown) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = [];

  constructor(private limit: number) {
    this.effectiveLimit = limit;
  }

  reportTinybirdRateLimit(): void {
    const previousLimit = this.effectiveLimit;
    this.effectiveLimit = Math.max(Math.floor(this.limit * this.backoffFactor), this.minLimit);

    console.warn(
      JSON.stringify({
        message: 'tinybird_adaptive_throttle',
        event: 'backoff',
        previousLimit,
        newLimit: this.effectiveLimit,
        active: this.count,
        queued: this.queue.length,
        timestamp: new Date().toISOString(),
      }),
    );

    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }

    this.recoveryTimer = setTimeout(() => {
      this.effectiveLimit = this.limit;
      this.recoveryTimer = null;
      console.warn(
        JSON.stringify({
          message: 'tinybird_adaptive_throttle',
          event: 'recovery',
          restoredLimit: this.limit,
          active: this.count,
          queued: this.queue.length,
          timestamp: new Date().toISOString(),
        }),
      );
    }, this.recoveryMs);
  }

  acquire(timeoutMs: number): Promise<void> {
    if (this.count >= this.effectiveLimit) {
      console.warn(
        JSON.stringify({
          message: 'tinybird_queue_status',
          active: this.count,
          queued: this.queue.length,
          effectiveLimit: this.effectiveLimit,
          limit: this.limit,
          timestamp: new Date().toISOString(),
        }),
      );
    }
    if (this.count < this.effectiveLimit) {
      this.count++;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.queue.findIndex((item) => item.resolve === resolve);
        if (idx !== -1) this.queue.splice(idx, 1);
        console.warn(
          JSON.stringify({
            message: 'tinybird_throttle',
            queueDepth: this.queue.length,
            effectiveLimit: this.effectiveLimit,
            limit: this.limit,
            timeoutMs,
            timestamp: new Date().toISOString(),
          }),
        );
        reject(
          createError({
            statusCode: 503,
            statusMessage: 'Tinybird request queue full — try again shortly',
          }),
        );
      }, timeoutMs);
      this.queue.push({ resolve, reject, timer });
    });
  }

  getActive(): number {
    return this.count;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getEffectiveLimit(): number {
    return this.effectiveLimit;
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      clearTimeout(next.timer);
      next.resolve();
    } else {
      this.count--;
    }
  }
}

const MAX_CONCURRENT = parseInt(process.env.NUXT_TINYBIRD_MAX_CONCURRENT || '35', 10);
const QUEUE_TIMEOUT_MS = parseInt(process.env.NUXT_TINYBIRD_QUEUE_TIMEOUT_MS || '15000', 10);
const SLOW_REQUEST_THRESHOLD_MS = parseInt(
  process.env.NUXT_TINYBIRD_SLOW_REQUEST_THRESHOLD_MS || '5000',
  10,
);
const tinybirdSemaphore = new AdaptiveSemaphore(MAX_CONCURRENT);

/**
 * Represents the structure of a response from the Tinybird API.
 *
 * @template T The type of the data returned in the response.
 *
 * @property {T} data The data returned by the query.
 * @property {Object[]} meta Metadata about the returned data fields.
 * @property {string} meta[].name The name of the field in the response.
 * @property {string} meta[].type The data type of the field in the response.
 * @property {number} rows The number of rows in the data response.
 * @property {number} rows_before_limit_at_least The number of rows available before any query limit was applied.
 * @property {Object} statistics Performance statistics for the query.
 * @property {number} statistics.elapsed Time in seconds it took to execute the query.
 * @property {number} statistics.rows_read Number of rows read during the query execution.
 * @property {number} statistics.bytes_read Number of bytes read during the query execution.
 */
export interface TinybirdResponse<T> {
  data: T;
  meta: {
    name: string;
    type: string;
  }[];
  rows: number;
  rows_before_limit_at_least: number;
  statistics: {
    elapsed: number;
    rows_read: number;
    bytes_read: number;
  };
}

// TinyBird requires dates to be in a specific format, otherwise it returns an error.
/**
 * Formats a given DateTime object into a string compatible with TinyBird's expected date format.
 *
 * @param {DateTime} date - The DateTime object to be formatted.
 * @return {string} A string representing the formatted date in 'yyyy-MM-dd 00:00:00' format or an empty string if formatting fails.
 */
function formatDateForTinyBird(date: DateTime): string {
  return date.toFormat('yyyy-MM-dd 00:00:00') ?? '';
}

/**
 * Fetches data from Tinybird using the specified path and query parameters.
 *
 * @param {string} path - The API endpoint path to fetch data from.
 * @param {Record<string, string | number | boolean | string[] | DateTime | undefined | null>} query - The query parameters to be sent in the request. Values that are undefined, null, or empty are omitted. DateTime objects are formatted to a compatible string.
 * @return {Promise<TinybirdResponse<T>>} A promise that resolves to the response from Tinybird, containing the requested data.
 */
export async function fetchFromTinybird<T>(
  path: string,
  query: Record<string, string | number | boolean | string[] | DateTime | undefined | null>,
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

  // We don't want to send undefined, null, or empty values to TinyBird, so we remove those from the query.
  // We also format DateTime objects so that TinyBird understands them.
  const processedQuery = Object.fromEntries(
    Object.entries(query)
      .filter(
        ([_, value]) =>
          value !== undefined && value !== '' && value !== null && !Number.isNaN(value),
      )
      .map(([key, value]) => [
        key,
        value instanceof DateTime ? formatDateForTinyBird(value) : value,
      ]),
  );

  const paramParts: string[] = [];
  for (const [key, value] of Object.entries(processedQuery)) {
    // Arrays need raw commas (not URL-encoded) for Tinybird Array() parameters
    if (Array.isArray(value)) {
      paramParts.push(
        `${encodeURIComponent(key)}=${value.map((v) => encodeURIComponent(String(v))).join(',')}`,
      );
    } else {
      paramParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  const params = paramParts.join('&');
  const url = params ? `${tinybirdBaseUrl}${path}?${params}` : `${tinybirdBaseUrl}${path}`;

  // Health-check pings bypass the semaphore to avoid readiness probe failures under load
  const skipThrottle = path === '/v0/pipes/ping.json';

  let acquired = false;
  const fetchStart = Date.now();
  try {
    if (!skipThrottle) {
      await tinybirdSemaphore.acquire(QUEUE_TIMEOUT_MS);
      acquired = true;
    }
    const data: TinybirdResponse<T> = await ofetch(url, {
      headers: {
        Authorization: `Bearer ${tinybirdToken}`,
      },
    });
    if (!data || !data.data) {
      throw new Error('Invalid response from Tinybird');
    }
    const durationMs = Date.now() - fetchStart;
    if (durationMs > SLOW_REQUEST_THRESHOLD_MS) {
      console.warn(
        JSON.stringify({
          message: 'tinybird_slow_request',
          pipe: path,
          params: processedQuery,
          durationMs,
          active: tinybirdSemaphore.getActive(),
          queued: tinybirdSemaphore.getQueueLength(),
          timestamp: new Date().toISOString(),
        }),
      );
    }
    return data;
  } catch (error: unknown) {
    const status =
      error && typeof error === 'object' && 'status' in error
        ? (error as { status: number }).status
        : undefined;

    console.error(
      JSON.stringify({
        message: 'tinybird_request_error',
        pipe: path,
        params: processedQuery,
        status,
        durationMs: Date.now() - fetchStart,
        active: tinybirdSemaphore.getActive(),
        queued: tinybirdSemaphore.getQueueLength(),
        timestamp: new Date().toISOString(),
      }),
    );

    if (status === 429) {
      tinybirdSemaphore.reportTinybirdRateLimit();
    }
    throw error;
  } finally {
    if (acquired) {
      tinybirdSemaphore.release();
    }
  }
}

/**
 * Fetches data from Tinybird using a POST request, sending parameters in the request body.
 * Use this instead of fetchFromTinybird when query parameters would make the URL too long
 * (e.g., when passing large arrays of IDs).
 *
 * @param {string} path - The API endpoint path to fetch data from.
 * @param {Record<string, string | number | boolean | string[] | DateTime | undefined | null>} params - The parameters to be sent in the request body.
 * @return {Promise<TinybirdResponse<T>>} A promise that resolves to the response from Tinybird.
 */
export async function postToTinybird<T>(
  path: string,
  params: Record<string, string | number | boolean | string[] | DateTime | undefined | null>,
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

  // Process params: remove undefined/null/empty values and format DateTime objects
  const processedParams = Object.fromEntries(
    Object.entries(params)
      .filter(
        ([_, value]) =>
          value !== undefined && value !== '' && value !== null && !Number.isNaN(value),
      )
      .map(([key, value]) => [
        key,
        value instanceof DateTime ? formatDateForTinyBird(value) : value,
      ]),
  );

  // Build URL-encoded body (Tinybird POST expects form-urlencoded params)
  const bodyParts: string[] = [];
  for (const [key, value] of Object.entries(processedParams)) {
    if (Array.isArray(value)) {
      bodyParts.push(
        `${encodeURIComponent(key)}=${value.map((v) => encodeURIComponent(String(v))).join(',')}`,
      );
    } else {
      bodyParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  const url = `${tinybirdBaseUrl}${path}`;

  const data: TinybirdResponse<T> = await ofetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tinybirdToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyParts.join('&'),
  });
  if (!data || !data.data) {
    throw new Error('Invalid response from Tinybird');
  }
  return data;
}

/**
 * Adds data to the specified Tinybird datasource.
 *
 * @param {string} datasource - The name of the Tinybird datasource where the data will be added.
 * @param {Record<string, string | number | boolean | string[] | DateTime | undefined | null>} data - The data to be added to the Tinybird datasource.
 * @return {Promise<boolean>} A promise that resolves to true if the data was successfully added.
 */
export async function addDataToTinybirdDatasource(
  datasource: string,
  data: object,
): Promise<boolean> {
  const tinybirdBaseUrl =
    process.env.NUXT_TINYBIRD_BASE_URL || 'https://api.us-west-2.aws.tinybird.co';
  const tinybirdToken = process.env.NUXT_TINYBIRD_TOKEN;

  if (!tinybirdBaseUrl) {
    throw new Error('Tinybird base URL is not defined');
  }
  if (!tinybirdToken) {
    throw new Error('Tinybird token is not defined');
  }

  const url = `${tinybirdBaseUrl}/v0/events?name=${datasource}`;

  await ofetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tinybirdToken}`,
    },
    body: JSON.stringify(data),
  });
  return true;
}
