// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TinybirdResponse } from './tinybird';

function mockResponse<T>(data: T): TinybirdResponse<T> {
  return {
    data,
    meta: [],
    rows: Array.isArray(data) ? data.length : 1,
    rows_before_limit_at_least: 0,
    statistics: { elapsed: 0, rows_read: 0, bytes_read: 0 },
  };
}

describe('getBucketIdForCollection', () => {
  afterEach(() => {
    delete process.env.NUXT_REDIS_URL;
    vi.clearAllMocks();
  });

  it('returns null for an empty collection slug without calling the fetcher', async () => {
    const { getBucketIdForCollection } = await import('./bucket-cache');
    const fetcher = vi.fn();

    const result = await getBucketIdForCollection('', fetcher);

    expect(result).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('resolves the bucketId from Tinybird for a valid collection slug', async () => {
    const { getBucketIdForCollection } = await import('./bucket-cache');
    const fetcher = vi.fn().mockResolvedValue(mockResponse([{ bucketId: 7 }]));

    const result = await getBucketIdForCollection('cncf', fetcher);

    expect(result).toBe(7);
    expect(fetcher).toHaveBeenCalledWith('/v0/pipes/collection_buckets.json', {
      collectionSlug: 'cncf',
    });
  });

  it('falls back to null (not fatal) when no bucket is found for the collection', async () => {
    const { getBucketIdForCollection } = await import('./bucket-cache');
    const fetcher = vi.fn().mockResolvedValue(mockResponse([]));

    const result = await getBucketIdForCollection('unknown-collection', fetcher);

    expect(result).toBeNull();
  });

  it('propagates rate limit errors instead of masking them as a cache miss', async () => {
    const { getBucketIdForCollection } = await import('./bucket-cache');
    const fetcher = vi.fn().mockRejectedValue({ statusCode: 429 });

    await expect(getBucketIdForCollection('cncf', fetcher)).rejects.toEqual({ statusCode: 429 });
  });

  it('propagates server errors instead of masking them as a cache miss', async () => {
    const { getBucketIdForCollection } = await import('./bucket-cache');
    const fetcher = vi.fn().mockRejectedValue({ statusCode: 503 });

    await expect(getBucketIdForCollection('cncf', fetcher)).rejects.toEqual({ statusCode: 503 });
  });

  it('returns null (fallback) for other fetch errors when Redis is enabled', async () => {
    process.env.NUXT_REDIS_URL = 'redis://localhost:6379';
    const { getBucketIdForCollection } = await import('./bucket-cache');
    const fetcher = vi.fn().mockRejectedValue(new Error('network error'));

    const result = await getBucketIdForCollection('cncf', fetcher);

    expect(result).toBeNull();
  });
});

describe('clearBucketCache / clearAllBucketCaches — write coordination', () => {
  afterEach(() => {
    delete process.env.NUXT_REDIS_URL;
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('clearBucketCache waits for an already-started project write so no stale value can be read once it resolves', async () => {
    process.env.NUXT_REDIS_URL = 'redis://localhost:6379';
    const { getBucketIdForProject, clearBucketCache } = await import('./bucket-cache');
    const { useStorage } = await import('#imports');
    const storage = useStorage('redis');

    let setItemStarted!: () => void;
    const setItemStartedPromise = new Promise<void>((resolve) => {
      setItemStarted = resolve;
    });
    let resolveSetItem: () => void = () => {};
    let firstSetItem = true;
    const originalSetItem = storage.setItem.bind(storage);
    vi.spyOn(storage, 'setItem').mockImplementation(async (...args) => {
      if (firstSetItem) {
        firstSetItem = false;
        setItemStarted();
        await new Promise<void>((resolve) => {
          resolveSetItem = resolve;
        });
      }
      return originalSetItem(...args);
    });

    const fetcher = vi.fn().mockResolvedValue(mockResponse([{ bucketId: 7 }]));
    const lookup = getBucketIdForProject('k8s', fetcher);
    await setItemStartedPromise;

    const clearPromise = clearBucketCache('k8s');
    let clearResolved = false;
    void clearPromise.then(() => {
      clearResolved = true;
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(clearResolved).toBe(false);

    resolveSetItem();
    await lookup;
    await clearPromise;

    expect(clearResolved).toBe(true);

    const freshFetcher = vi.fn().mockResolvedValue(mockResponse([{ bucketId: 9 }]));
    const afterClear = await getBucketIdForProject('k8s', freshFetcher);
    expect(afterClear).toBe(9);
  });

  it('clearAllBucketCaches waits for an already-started collection write before clearing', async () => {
    process.env.NUXT_REDIS_URL = 'redis://localhost:6379';
    const { getBucketIdForCollection, clearAllBucketCaches } = await import('./bucket-cache');
    const { useStorage } = await import('#imports');
    const storage = useStorage('redis');

    let setItemStarted!: () => void;
    const setItemStartedPromise = new Promise<void>((resolve) => {
      setItemStarted = resolve;
    });
    let resolveSetItem: () => void = () => {};
    let firstSetItem = true;
    const originalSetItem = storage.setItem.bind(storage);
    vi.spyOn(storage, 'setItem').mockImplementation(async (...args) => {
      if (firstSetItem) {
        firstSetItem = false;
        setItemStarted();
        await new Promise<void>((resolve) => {
          resolveSetItem = resolve;
        });
      }
      return originalSetItem(...args);
    });

    const fetcher = vi.fn().mockResolvedValue(mockResponse([{ bucketId: 3 }]));
    const lookup = getBucketIdForCollection('cncf', fetcher);
    await setItemStartedPromise;

    const clearPromise = clearAllBucketCaches();
    let clearResolved = false;
    void clearPromise.then(() => {
      clearResolved = true;
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(clearResolved).toBe(false);

    resolveSetItem();
    await lookup;
    await clearPromise;

    expect(clearResolved).toBe(true);

    const freshFetcher = vi.fn().mockResolvedValue(mockResponse([{ bucketId: 5 }]));
    const afterClear = await getBucketIdForCollection('cncf', freshFetcher);
    expect(afterClear).toBe(5);
  });
});
