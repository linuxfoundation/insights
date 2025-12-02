// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { TinybirdResponse } from './tinybird';

/**
 * In-memory cache to prevent cache stampede (multiple concurrent requests for same project).
 * Maps project name to a Promise that resolves to bucketId.
 * Only used when Redis is available.
 */
const inFlightRequests = new Map<string, Promise<number | null>>();

/**
 * Response type from the project_buckets Tinybird pipe
 */
interface ProjectBucketResponse {
  bucketId: number;
}

/**
 * Check if Redis caching is enabled
 */
function isRedisEnabled(): boolean {
  return !!process.env.NUXT_REDIS_URL && process.env.NUXT_REDIS_URL.length > 0;
}

/**
 * Fetches the bucketId for a given project from Tinybird.
 *
 * Caching strategy depends on environment:
 * - Local (no NUXT_REDIS_URL): Always fetches fresh from Tinybird (no caching)
 * - Production (with NUXT_REDIS_URL): Uses Redis cache (24hr TTL)
 *
 * @param {string} project - The project name/slug to fetch bucketId for
 * @param {Function} fetcher - The fetchFromTinybird function (injected to avoid circular dependency)
 * @return {Promise<number | null>} The bucketId for the project, or null if not found/error occurred
 *
 * @example
 * const bucketId = await getBucketIdForProject('k8s', fetchFromTinybird);
 * // Returns: 9
 */
export async function getBucketIdForProject(
  project: string,
  fetcher: <T>(
    path: string,
    query: Record<string, string | number | boolean | string[] | undefined | null>,
  ) => Promise<TinybirdResponse<T>>,
): Promise<number | null> {
  // Validate input
  const projectValue = project?.toString().trim();
  if (!projectValue || projectValue.length === 0) {
    console.warn('getBucketIdForProject: Invalid project value provided');
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
    } catch (error) {
      console.error(`Failed to fetch bucketId for project ${projectValue}:`, error);
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
    console.warn(`No bucketId found for project: ${projectValue}`);
    return null;
  }

  const bucketId = response.data[0]?.bucketId;

  if (typeof bucketId !== 'number') {
    console.warn(`Invalid bucketId type for project ${projectValue}:`, typeof bucketId);
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

    await Promise.all(keys.map((key) => storage.removeItem(key)));
  } catch (error) {
    console.error('Failed to clear all bucket caches:', error);
  }

  // Clear in-flight requests
  inFlightRequests.clear();
}
