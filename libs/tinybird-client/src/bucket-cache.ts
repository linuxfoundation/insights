// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { TinybirdLogger, TinybirdQuery, TinybirdResponse, BucketCacheStorage } from './types.js';

interface ProjectBucketResponse {
  bucketId: number;
}

type Fetcher = <T>(path: string, query: TinybirdQuery) => Promise<TinybirdResponse<T>>;

export function createBucketCache(
  storage: BucketCacheStorage | undefined,
  logger: TinybirdLogger,
) {
  /** In-memory map preventing cache stampede for concurrent requests on the same project. */
  const inFlightRequests = new Map<string, Promise<number | null>>();

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
      return fetchFromTinybird(projectValue, fetcher);
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

        try {
          await storage.setItem(cacheKey, bucketId, { ttl: 86400 });
        } catch (err) {
          logger.error(`Failed to cache bucketId for project ${projectValue}: ${err}`);
        }

        return bucketId;
      } catch (error: unknown) {
        // Propagate rate-limit and server errors instead of masking them as null
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const status = (error as { statusCode: number }).statusCode;
          if (status === 429 || status >= 500) throw error;
        }
        logger.warn(`Failed to fetch bucketId for project ${projectValue}: ${error}`);
        return null;
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

    if (!storage) return;

    const cacheKey = `project_bucket:${projectValue}`;
    try {
      await storage.removeItem(cacheKey);
    } catch (err) {
      logger.error(`Failed to clear bucket cache for project ${projectValue}: ${err}`);
    }
  }

  async function clearAllBucketCaches(): Promise<void> {
    inFlightRequests.clear();

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
