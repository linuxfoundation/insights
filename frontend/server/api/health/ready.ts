// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getInsightsDbPool } from '~~/server/utils/db';
import { getRedisClient } from '~~/server/utils/redis-client';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { isLocal } from '~~/server/utils/common';
import type { PingResult } from '~~/types/health';

const CHECK_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timed out')), ms)),
  ]);
}

/**
 * API Endpoint: /api/health/ready
 * Method: GET
 * Readiness check used by Kubernetes to verify the pod is ready to receive traffic.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const [dbResult, tinybirdResult, redisResult] = await Promise.allSettled([
    withTimeout(
      (async () => {
        const pool = getInsightsDbPool();
        const client = await pool.connect();
        try {
          await client.query('SELECT 1');
        } finally {
          client.release();
        }
      })(),
      CHECK_TIMEOUT_MS,
    ),

    withTimeout(
      (async () => {
        const result = await fetchFromTinybird<PingResult[]>('/v0/pipes/ping.json', {});
        if (!(result.data.length > 0 && result.data[0].result === 'pong')) {
          throw new Error('unexpected ping response');
        }
      })(),
      CHECK_TIMEOUT_MS,
    ),

    config.redisUrl
      ? withTimeout(
          (async () => {
            const redis = await getRedisClient(config.redisUrl, 0, true);
            await redis.ping();
          })(),
          CHECK_TIMEOUT_MS,
        )
      : Promise.resolve(),
  ]);

  const checks = {
    db: dbResult.status === 'fulfilled',
    tinybird: tinybirdResult.status === 'fulfilled',
    ...(config.redisUrl ? { redis: redisResult.status === 'fulfilled' } : {}),
  };

  const ready = Object.values(checks).every(Boolean);

  if (!ready) {
    const internalErrors = [
      dbResult.status === 'rejected' ? `db: ${dbResult.reason?.message}` : null,
      tinybirdResult.status === 'rejected' ? `tinybird: ${tinybirdResult.reason?.message}` : null,
      config.redisUrl && redisResult.status === 'rejected'
        ? `redis: ${redisResult.reason?.message}`
        : null,
    ]
      .filter(Boolean)
      .join('; ');

    console.error('[health/ready] readiness check failed:', internalErrors);

    setResponseStatus(event, 503);
    return {
      ready: false,
      checks,
      detail: isLocal ? internalErrors : 'one or more dependency checks failed',
    };
  }

  return { ready: true, checks };
});
