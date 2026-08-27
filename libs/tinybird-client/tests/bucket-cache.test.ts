// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createBucketCache } from '../src/bucket-cache.js';
import { TinybirdClientError, TinybirdUnavailableError } from '../src/errors.js';
import type { BucketCacheStorage, TinybirdLogger, TinybirdResponse } from '../src/types.js';

const logger: TinybirdLogger = { warn: vi.fn(), error: vi.fn() };

function bucketResponse(bucketId: number): TinybirdResponse<{ bucketId: number }[]> {
  return {
    data: [{ bucketId }],
    meta: [{ name: 'bucketId', type: 'Int32' }],
    rows: 1,
    statistics: { elapsed: 0.1, rows_read: 1, bytes_read: 10 },
  };
}

function createMemoryStorage(): BucketCacheStorage {
  const store = new Map<string, number>();
  return {
    async getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    async setItem(key, value) {
      store.set(key, value);
    },
    async removeItem(key) {
      store.delete(key);
    },
    async getKeys(prefix) {
      return [...store.keys()].filter((k) => k.startsWith(prefix));
    },
  };
}

describe('createBucketCache — getBucketIdForProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches fresh every time when no storage is configured', async () => {
    const cache = createBucketCache(undefined, logger);
    const fetcher = vi.fn().mockResolvedValue(bucketResponse(7));

    const first = await cache.getBucketIdForProject('k8s', fetcher);
    const second = await cache.getBucketIdForProject('k8s', fetcher);

    expect(first).toBe(7);
    expect(second).toBe(7);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('caches the bucketId in storage after a successful fetch', async () => {
    const storage = createMemoryStorage();
    const cache = createBucketCache(storage, logger);
    const fetcher = vi.fn().mockResolvedValue(bucketResponse(9));

    await cache.getBucketIdForProject('k8s', fetcher);
    const second = await cache.getBucketIdForProject('k8s', fetcher);

    expect(second).toBe(9);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('coalesces concurrent in-flight requests for the same project', async () => {
    const storage = createMemoryStorage();
    const cache = createBucketCache(storage, logger);
    let resolveFetch: (value: TinybirdResponse<{ bucketId: number }[]>) => void = () => {};
    const fetcher = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const p1 = cache.getBucketIdForProject('k8s', fetcher);
    const p2 = cache.getBucketIdForProject('k8s', fetcher);
    resolveFetch(bucketResponse(3));

    expect(await p1).toBe(3);
    expect(await p2).toBe(3);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('propagates a 401 error instead of masking it as a missing project', async () => {
    const storage = createMemoryStorage();
    const cache = createBucketCache(storage, logger);
    const fetcher = vi.fn().mockRejectedValue(new TinybirdClientError(401, 'Unauthorized'));

    await expect(cache.getBucketIdForProject('k8s', fetcher)).rejects.toThrow('Unauthorized');
  });

  it('propagates a 403 error instead of masking it as a missing project', async () => {
    const storage = createMemoryStorage();
    const cache = createBucketCache(storage, logger);
    const fetcher = vi.fn().mockRejectedValue(new TinybirdClientError(403, 'Forbidden'));

    await expect(cache.getBucketIdForProject('k8s', fetcher)).rejects.toThrow('Forbidden');
  });

  it('wraps unclassified errors as TinybirdUnavailableError instead of a false "not found"', async () => {
    const storage = createMemoryStorage();
    const cache = createBucketCache(storage, logger);
    const fetcher = vi.fn().mockRejectedValue(new Error('network blip'));

    await expect(cache.getBucketIdForProject('k8s', fetcher)).rejects.toThrow(
      TinybirdUnavailableError,
    );
  });

  it('wraps unclassified errors as TinybirdUnavailableError when no storage is configured', async () => {
    const cache = createBucketCache(undefined, logger);
    const fetcher = vi.fn().mockRejectedValue(new Error('network blip'));

    await expect(cache.getBucketIdForProject('k8s', fetcher)).rejects.toThrow(
      TinybirdUnavailableError,
    );
  });

  it('does not repopulate the cache from a stale in-flight write after clearBucketCache', async () => {
    const storage = createMemoryStorage();
    const cache = createBucketCache(storage, logger);

    let resolveFetch: (value: TinybirdResponse<{ bucketId: number }[]>) => void = () => {};
    const slowFetcher = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const inFlight = cache.getBucketIdForProject('k8s', slowFetcher);
    // Cache is cleared while the lookup above is still in flight.
    await cache.clearBucketCache('k8s');
    resolveFetch(bucketResponse(5));
    await inFlight;

    const freshFetcher = vi.fn().mockResolvedValue(bucketResponse(11));
    const afterClear = await cache.getBucketIdForProject('k8s', freshFetcher);

    // The stale write from the in-flight lookup must not have won; the cache should
    // have been empty, forcing a fresh fetch that returns the new value.
    expect(afterClear).toBe(11);
    expect(freshFetcher).toHaveBeenCalledTimes(1);
  });

  it('does not repopulate any cache entry from a stale in-flight write after clearAllBucketCaches', async () => {
    const storage = createMemoryStorage();
    const cache = createBucketCache(storage, logger);

    let resolveFetch: (value: TinybirdResponse<{ bucketId: number }[]>) => void = () => {};
    const slowFetcher = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const inFlight = cache.getBucketIdForProject('k8s', slowFetcher);
    await cache.clearAllBucketCaches();
    resolveFetch(bucketResponse(5));
    await inFlight;

    const freshFetcher = vi.fn().mockResolvedValue(bucketResponse(13));
    const afterClear = await cache.getBucketIdForProject('k8s', freshFetcher);

    expect(afterClear).toBe(13);
    expect(freshFetcher).toHaveBeenCalledTimes(1);
  });
});
