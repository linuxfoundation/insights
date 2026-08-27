// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { TinybirdUnavailableError } from './errors.js';
import type {
  TinybirdLogger,
  TinybirdQuery,
  TinybirdResponse,
  BucketCacheStorage,
} from './types.js';

interface ProjectBucketResponse {
  bucketId: number;
}

type Fetcher = <T>(path: string, query: TinybirdQuery) => Promise<TinybirdResponse<T>>;

function isClassifiedTinybirdError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'statusCode' in error);
}

/**
 * Rethrows classified Tinybird errors as-is; wraps everything else (network/DNS
 * failures, malformed responses) so callers never mistake "lookup unavailable"
 * for "project doesn't exist" — an unclassified error must never resolve to null.
 */
function classifyBucketLookupError(error: unknown, projectValue: string): never {
  if (isClassifiedTinybirdError(error)) {
    throw error;
  }
  throw new TinybirdUnavailableError(
    `Failed to fetch bucketId for project ${projectValue}: ${error}`,
  );
}

export function createBucketCache(storage: BucketCacheStorage | undefined, logger: TinybirdLogger) {
  /** In-memory map preventing cache stampede for concurrent requests on the same project. */
  const inFlightRequests = new Map<string, Promise<number | null>>();
  /** Per-key invalidation counters so a stale in-flight write can't repopulate a just-cleared cache entry. */
  const invalidationGenerations = new Map<string, number>();
  let globalInvalidationGeneration = 0;

  function currentGeneration(cacheKey: string): number {
    return (invalidationGenerations.get(cacheKey) ?? 0) + globalInvalidationGeneration;
  }

  async function fetchFromTinybird(project: string, fetcher: Fetcher): Promise<number | null> {
    const response = await fetcher<ProjectBucketResponse[]>('/v0/pipes/project_buckets.json', {
      project,
    });

    if (!response?.data || !Array.isArray(response.data) || response.data.length === 0) {
      logger.warn(
        JSON.stringify({
          message: 'tinybird_bucket_not_found',
          project,
          timestamp: new Date().toISOString(),
        }),
      );
      return null;
    }

    const bucketId = response.data[0]?.bucketId;

    if (typeof bucketId !== 'number') {
      logger.warn(
        JSON.stringify({
          message: 'tinybird_bucket_invalid_type',
          project,
          bucketIdType: typeof bucketId,
          timestamp: new Date().toISOString(),
        }),
      );
      return null;
    }

    return bucketId;
  }

  async function getBucketIdForProject(project: string, fetcher: Fetcher): Promise<number | null> {
    const projectValue = project?.toString().trim();
    if (!projectValue) {
      logger.warn(
        JSON.stringify({
          message: 'tinybird_bucket_invalid_project',
          timestamp: new Date().toISOString(),
        }),
      );
      return null;
    }

    // No storage configured — always fetch fresh (local dev path)
    if (!storage) {
      try {
        return await fetchFromTinybird(projectValue, fetcher);
      } catch (error: unknown) {
        classifyBucketLookupError(error, projectValue);
      }
    }

    // Prevent cache stampede: reuse any in-flight request for the same project
    if (inFlightRequests.has(projectValue)) {
      try {
        return await inFlightRequests.get(projectValue)!;
      } catch {
        inFlightRequests.delete(projectValue);
      }
    }

    const cacheKey = `project_bucket:${projectValue}`;
    const generation = currentGeneration(cacheKey);

    const fetchPromise = (async () => {
      try {
        const cached = await storage.getItem(cacheKey);
        if (cached !== null && cached !== undefined) {
          return cached;
        }
      } catch (err) {
        logger.error(`Failed to read from bucket cache for project ${projectValue}: ${err}`);
      }

      try {
        const bucketId = await fetchFromTinybird(projectValue, fetcher);
        if (bucketId === null) return null;

        if (currentGeneration(cacheKey) === generation) {
          try {
            await storage.setItem(cacheKey, bucketId, { ttl: 86400 });
          } catch (err) {
            logger.error(`Failed to cache bucketId for project ${projectValue}: ${err}`);
          }
        }

        return bucketId;
      } catch (error: unknown) {
        // Propagate all classified Tinybird errors (401/403/404/429/5xx), and wrap
        // unclassified failures (network/DNS) instead of masking either as a false
        // "project not found" via a `null` return.
        classifyBucketLookupError(error, projectValue);
      } finally {
        inFlightRequests.delete(projectValue);
      }
    })();

    inFlightRequests.set(projectValue, fetchPromise);
    return fetchPromise;
  }

  async function clearBucketCache(project: string): Promise<void> {
    const projectValue = project?.toString().trim();
    if (!projectValue) return;

    inFlightRequests.delete(projectValue);

    const cacheKey = `project_bucket:${projectValue}`;
    invalidationGenerations.set(cacheKey, (invalidationGenerations.get(cacheKey) ?? 0) + 1);

    if (!storage) return;

    try {
      await storage.removeItem(cacheKey);
    } catch (err) {
      logger.error(`Failed to clear bucket cache for project ${projectValue}: ${err}`);
    }
  }

  async function clearAllBucketCaches(): Promise<void> {
    inFlightRequests.clear();
    globalInvalidationGeneration += 1;

    if (!storage) return;

    try {
      const keys = await storage.getKeys('project_bucket:');
      await Promise.all(keys.map((key) => storage.removeItem(key)));
    } catch (err) {
      logger.error(`Failed to clear all bucket caches: ${err}`);
    }
  }

  return { getBucketIdForProject, clearBucketCache, clearAllBucketCaches };
}
