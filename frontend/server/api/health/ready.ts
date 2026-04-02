// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getInsightsDbPool } from '~~/server/utils/db';
import { getRedisClient } from '~~/server/utils/redis-client';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { PingResult } from '~~/types/health';

/**
 * API Endpoint: /api/health/ready
 * Method: GET
 * Readiness check used by Kubernetes to verify the pod is ready to receive traffic.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const checks: Record<string, boolean> = {};
  const errors: string[] = [];

  try {
    const pool = getInsightsDbPool();
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      checks.db = true;
    } finally {
      client.release();
    }
  } catch (err) {
    checks.db = false;
    errors.push(`db: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    const result = await fetchFromTinybird<PingResult[]>('/v0/pipes/ping.json', {});
    checks.tinybird = result.data.length > 0 && result.data[0].result === 'pong';
    if (!checks.tinybird) errors.push('tinybird: unexpected ping response');
  } catch (err) {
    checks.tinybird = false;
    errors.push(`tinybird: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (config.redisUrl) {
    try {
      const redis = await getRedisClient(config.redisUrl, 0, true);
      await redis.ping();
      checks.redis = true;
    } catch (err) {
      checks.redis = false;
      errors.push(`redis: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const ready = Object.values(checks).every(Boolean);

  if (!ready) {
    setResponseStatus(event, 503);
    return { ready: false, checks, detail: errors.join('; ') };
  }

  return { ready: true, checks };
});
