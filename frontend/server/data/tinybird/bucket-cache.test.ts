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
