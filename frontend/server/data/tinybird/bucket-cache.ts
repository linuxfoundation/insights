// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { client } from './tinybird';

export async function getBucketIdForProject(
  project: string,
  _fetcher?: unknown,
): Promise<number | null> {
  // Validate input
  const projectValue = project?.toString().trim();
  if (!projectValue || projectValue.length === 0) {
    console.warn(
      JSON.stringify({
        message: 'tinybird_bucket_invalid_project',
        timestamp: new Date().toISOString(),
      }),
    );
    return null;
  }

  const redisEnabled = isRedisEnabled();

  // If Redis is not enabled (local dev), skip all caching and fetch directly
  if (!redisEnabled) {
    return await fetchBucketIdFromTinybird(projectValue, fetcher);
  }

  // Check if there's already a request in flight for this project (prevent cache stampede)
  if (inFlightRequests.has(projectValue)) {
    try {
      return await inFlightRequests.get(projectValue)!;
    } catch {
      // If the in-flight request failed, we'll try again below
      inFlightRequests.delete(projectValue);
    }
  }

  const cacheKey = `project_bucket:${projectValue}`;

  // Create and store the fetch promise immediately to prevent race conditions
  const fetchPromise = (async () => {
    // Try to get from Redis cache first
    try {
      const storage = useStorage('redis');
      const cachedBucketId = await storage.getItem<number>(cacheKey);

      if (cachedBucketId !== null && cachedBucketId !== undefined) {
        return cachedBucketId;
      }
    } catch (cacheError) {
      console.error(`Failed to read from Redis cache for project ${projectValue}:`, cacheError);
    }

    try {
      const bucketId = await fetchBucketIdFromTinybird(projectValue, fetcher);

      if (bucketId === null) {
        return null;
      }

      try {
        const storage = useStorage('redis');
        await storage.setItem(cacheKey, bucketId, { ttl: 86400 });
      } catch (cacheError) {
        console.error(`Failed to cache bucketId for project ${projectValue}:`, cacheError);
      }

      return bucketId;
    } catch (error: unknown) {
      // Propagate rate limit and server errors instead of masking them as 404
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const status = (error as { statusCode: number }).statusCode;
        if (status === 429 || status >= 500) {
          throw error;
        }
      }
      console.warn(`Failed to fetch bucketId for project ${projectValue}:`, error);
      return null;
    } finally {
      // Clean up in-flight request tracker
      inFlightRequests.delete(projectValue);
    }
  })();

  // Store the promise to prevent duplicate requests
  inFlightRequests.set(projectValue, fetchPromise);

  return fetchPromise;
}

/**
 * Internal function to fetch bucketId from Tinybird API
 */
async function fetchBucketIdFromTinybird(
  projectValue: string,
  fetcher: <T>(
    path: string,
    query: Record<string, string | number | boolean | string[] | undefined | null>,
  ) => Promise<TinybirdResponse<T>>,
): Promise<number | null> {
  const response = await fetcher<ProjectBucketResponse[]>('/v0/pipes/project_buckets.json', {
    project: projectValue,
  });

  // Validate response structure
  if (!response?.data || !Array.isArray(response.data) || response.data.length === 0) {
    console.warn(
      JSON.stringify({
        message: 'tinybird_bucket_not_found',
        project: projectValue,
        timestamp: new Date().toISOString(),
      }),
    );
    return null;
  }

  const bucketId = response.data[0]?.bucketId;

  if (typeof bucketId !== 'number') {
    console.warn(
      JSON.stringify({
        message: 'tinybird_bucket_invalid_type',
        project: projectValue,
        bucketIdType: typeof bucketId,
        timestamp: new Date().toISOString(),
      }),
    );
    return null;
  }

  return bucketId;
}

export async function getBucketIdForCollection(
  collectionSlug: string,
  fetcher: <T>(
    path: string,
    query: Record<string, string | number | boolean | string[] | undefined | null>,
  ) => Promise<TinybirdResponse<T>>,
): Promise<number | null> {
  const slugValue = collectionSlug?.toString().trim();
  if (!slugValue || slugValue.length === 0) {
    console.warn(
      JSON.stringify({
        message: 'tinybird_bucket_invalid_collection',
        timestamp: new Date().toISOString(),
      }),
    );
    return null;
  }

  const redisEnabled = isRedisEnabled();

  if (!redisEnabled) {
    return await fetchBucketIdForCollectionFromTinybird(slugValue, fetcher);
  }

  if (collectionInFlightRequests.has(slugValue)) {
    try {
      return await collectionInFlightRequests.get(slugValue)!;
    } catch {
      collectionInFlightRequests.delete(slugValue);
    }
  }

  const cacheKey = `collection_bucket:${slugValue}`;

  const fetchPromise = (async () => {
    try {
      const storage = useStorage('redis');
      const cachedBucketId = await storage.getItem<number>(cacheKey);

      if (cachedBucketId !== null && cachedBucketId !== undefined) {
        return cachedBucketId;
      }
    } catch (cacheError) {
      console.error(`Failed to read from Redis cache for collection ${slugValue}:`, cacheError);
    }

    try {
      const bucketId = await fetchBucketIdForCollectionFromTinybird(slugValue, fetcher);

      if (bucketId === null) {
        return null;
      }

      try {
        const storage = useStorage('redis');
        await storage.setItem(cacheKey, bucketId, { ttl: 86400 });
      } catch (cacheError) {
        console.error(`Failed to cache bucketId for collection ${slugValue}:`, cacheError);
      }

      return bucketId;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const status = (error as { statusCode: number }).statusCode;
        if (status === 429 || status >= 500) {
          throw error;
        }
      }
      console.warn(`Failed to fetch bucketId for collection ${slugValue}:`, error);
      return null;
    } finally {
      collectionInFlightRequests.delete(slugValue);
    }
  })();

  collectionInFlightRequests.set(slugValue, fetchPromise);

  return fetchPromise;
}

async function fetchBucketIdForCollectionFromTinybird(
  slugValue: string,
  fetcher: <T>(
    path: string,
    query: Record<string, string | number | boolean | string[] | undefined | null>,
  ) => Promise<TinybirdResponse<T>>,
): Promise<number | null> {
  const response = await fetcher<CollectionBucketResponse[]>('/v0/pipes/collection_buckets.json', {
    collectionSlug: slugValue,
  });

  if (!response?.data || !Array.isArray(response.data) || response.data.length === 0) {
    console.warn(
      JSON.stringify({
        message: 'tinybird_bucket_not_found',
        collectionSlug: slugValue,
        timestamp: new Date().toISOString(),
      }),
    );
    return null;
  }

  const bucketId = response.data[0]?.bucketId;

  if (typeof bucketId !== 'number') {
    console.warn(
      JSON.stringify({
        message: 'tinybird_bucket_invalid_type',
        collectionSlug: slugValue,
        bucketIdType: typeof bucketId,
        timestamp: new Date().toISOString(),
      }),
    );
    return null;
  }

  return bucketId;
}

/**
 * Clears the cached bucketId for a specific project.
 * Only works when Redis is enabled.
 * Useful for testing or when bucket assignments change.
 *
 * @param {string} project - The project name/slug to clear from cache
 * @return {Promise<void>}
 */
export async function clearBucketCache(project: string): Promise<void> {
  const projectValue = project?.toString().trim();
  if (!projectValue) {
    return;
  }

  if (!isRedisEnabled()) {
    // No cache to clear in local mode
    return;
  }

  const cacheKey = `project_bucket:${projectValue}`;

  try {
    const storage = useStorage('redis');
    await storage.removeItem(cacheKey);
  } catch (error) {
    console.error(`Failed to clear bucket cache for project ${projectValue}:`, error);
  }

  // Also clear from in-flight requests
  inFlightRequests.delete(projectValue);
}

/**
 * Clears all cached bucket IDs.
 * Only works when Redis is enabled.
 * Useful for testing or bulk cache invalidation.
 *
 * @return {Promise<void>}
 */
export async function clearAllBucketCaches(): Promise<void> {
  if (!isRedisEnabled()) {
    // No cache to clear in local mode
    return;
  }

  try {
    const storage = useStorage('redis');
    const keys = await storage.getKeys('project_bucket:');
    const collectionKeys = await storage.getKeys('collection_bucket:');

    await Promise.all([...keys, ...collectionKeys].map((key) => storage.removeItem(key)));
  } catch (error) {
    console.error('Failed to clear all bucket caches:', error);
  }

  // Clear in-flight requests
  inFlightRequests.clear();
  collectionInFlightRequests.clear();
}
