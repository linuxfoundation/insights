// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { TinybirdInvalidResponseError, TinybirdUnavailableError } from './errors.js';
import type {
  TinybirdLogger,
  TinybirdQuery,
  TinybirdResponse,
  BucketCacheStorage,
} from './types.js';

interface ProjectBucketResponse {
  bucketId: number;
}

interface CollectionBucketResponse {
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

  /** Same stampede-prevention strategy as above, kept separate since collection lookups are nonfatal on failure. */
  const collectionInFlightRequests = new Map<string, Promise<number | null>>();

  /**
   * Tracks the in-flight storage write for each cache key. A clear must await the
   * matching entry (if any) before it removes the key, so a write that was already
   * underway when the clear started cannot land afterward and outlive it — closing
   * the window where a reader could observe a stale value after invalidation.
   */
  const pendingWrites = new Map<string, Promise<void>>();

  function currentGeneration(cacheKey: string): number {
    return (invalidationGenerations.get(cacheKey) ?? 0) + globalInvalidationGeneration;
  }

  async function writeToCache(cacheKey: string, bucketId: number, label: string): Promise<void> {
    const writePromise = (async () => {
      try {
        await storage!.setItem(cacheKey, bucketId, { ttl: 86400 });
      } catch (err) {
        logger.error(`Failed to cache bucketId for ${label}: ${err}`);
      }
    })();
    pendingWrites.set(cacheKey, writePromise);
    try {
      await writePromise;
    } finally {
      if (pendingWrites.get(cacheKey) === writePromise) {
        pendingWrites.delete(cacheKey);
      }
    }
  }

  async function waitForPendingWrite(cacheKey: string): Promise<void> {
    const pending = pendingWrites.get(cacheKey);
    if (pending) {
      await pending.catch(() => {});
    }
  }

  async function fetchFromTinybird(project: string, fetcher: Fetcher): Promise<number | null> {
    const response = await fetcher<ProjectBucketResponse[]>('/v0/pipes/project_buckets.json', {
      project,
    });

    if (!response?.data || !Array.isArray(response.data)) {
      throw new TinybirdInvalidResponseError(
        `Malformed project_buckets response for project ${project}`,
      );
    }

    if (response.data.length === 0) {
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
      throw new TinybirdInvalidResponseError(
        `Malformed bucketId (type ${typeof bucketId}) for project ${project}`,
      );
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

    // Prevent cache stampede: reuse any in-flight request for the same project.
    // Its `finally` clause already removes it from the map, and every waiter must
    // observe the same rejection rather than each starting its own replacement fetch.
    if (inFlightRequests.has(projectValue)) {
      return inFlightRequests.get(projectValue)!;
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
          await writeToCache(cacheKey, bucketId, `project ${projectValue}`);
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

  async function fetchCollectionFromTinybird(
    collectionSlug: string,
    fetcher: Fetcher,
  ): Promise<number | null> {
    const response = await fetcher<CollectionBucketResponse[]>(
      '/v0/pipes/collection_buckets.json',
      { collectionSlug },
    );

    if (!response?.data || !Array.isArray(response.data) || response.data.length === 0) {
      logger.warn(
        JSON.stringify({
          message: 'tinybird_bucket_not_found',
          collectionSlug,
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
          collectionSlug,
          bucketIdType: typeof bucketId,
          timestamp: new Date().toISOString(),
        }),
      );
      return null;
    }

    return bucketId;
  }

  /**
   * Unlike project routing, a failed or missing collection lookup is nonfatal: callers
   * fall back to the multi-bucket union pipe, so this never throws for a 404/empty result.
   * Rate-limit and server errors still propagate so they aren't silently swallowed as
   * "no collection bucket".
   */
  async function getBucketIdForCollection(
    collectionSlug: string,
    fetcher: Fetcher,
  ): Promise<number | null> {
    const slugValue = collectionSlug?.toString().trim();
    if (!slugValue) {
      logger.warn(
        JSON.stringify({
          message: 'tinybird_bucket_invalid_collection',
          timestamp: new Date().toISOString(),
        }),
      );
      return null;
    }

    if (!storage) {
      return fetchCollectionSafely(slugValue, fetcher);
    }

    if (collectionInFlightRequests.has(slugValue)) {
      return collectionInFlightRequests.get(slugValue)!;
    }

    const cacheKey = `collection_bucket:${slugValue}`;
    const generation = currentGeneration(cacheKey);

    const fetchPromise = (async () => {
      try {
        try {
          const cached = await storage.getItem(cacheKey);
          if (cached !== null && cached !== undefined) {
            return cached;
          }
        } catch (err) {
          logger.error(`Failed to read from bucket cache for collection ${slugValue}: ${err}`);
        }

        const bucketId = await fetchCollectionSafely(slugValue, fetcher);
        if (bucketId === null) return null;

        if (currentGeneration(cacheKey) === generation) {
          await writeToCache(cacheKey, bucketId, `collection ${slugValue}`);
        }

        return bucketId;
      } finally {
        collectionInFlightRequests.delete(slugValue);
      }
    })();

    collectionInFlightRequests.set(slugValue, fetchPromise);
    return fetchPromise;
  }

  /** Fetches without throwing: propagates only rate-limit/server errors, otherwise logs and returns null. */
  async function fetchCollectionSafely(
    slugValue: string,
    fetcher: Fetcher,
  ): Promise<number | null> {
    try {
      return await fetchCollectionFromTinybird(slugValue, fetcher);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const status = (error as { statusCode: number }).statusCode;
        if (status === 429 || status >= 500) {
          throw error;
        }
      }
      logger.warn(`Failed to fetch bucketId for collection ${slugValue}: ${error}`);
      return null;
    }
  }

  async function clearBucketCache(project: string): Promise<void> {
    const projectValue = project?.toString().trim();
    if (!projectValue) return;

    inFlightRequests.delete(projectValue);

    const cacheKey = `project_bucket:${projectValue}`;
    invalidationGenerations.set(cacheKey, (invalidationGenerations.get(cacheKey) ?? 0) + 1);

    if (!storage) return;

    // Wait for any write already underway for this key before clearing it, so that
    // write cannot land after we've cleared and leave a stale value behind.
    await waitForPendingWrite(cacheKey);

    try {
      await storage.removeItem(cacheKey);
    } catch (err) {
      logger.error(`Failed to clear bucket cache for project ${projectValue}: ${err}`);
    }
  }

  async function clearAllBucketCaches(): Promise<void> {
    inFlightRequests.clear();
    collectionInFlightRequests.clear();
    globalInvalidationGeneration += 1;

    if (!storage) return;

    // Wait for every write already underway before clearing, for the same reason as above.
    await Promise.all([...pendingWrites.values()].map((p) => p.catch(() => {})));

    try {
      const [projectKeys, collectionKeys] = await Promise.all([
        storage.getKeys('project_bucket:'),
        storage.getKeys('collection_bucket:'),
      ]);
      await Promise.all([...projectKeys, ...collectionKeys].map((key) => storage.removeItem(key)));
    } catch (err) {
      logger.error(`Failed to clear all bucket caches: ${err}`);
    }
  }

  return {
    getBucketIdForProject,
    getBucketIdForCollection,
    clearBucketCache,
    clearAllBucketCaches,
  };
}
