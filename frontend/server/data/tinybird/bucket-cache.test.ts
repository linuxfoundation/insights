// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TinybirdResponse } from './tinybird';

// `useStorage` is auto-imported by Nitro in real server code but isn't injected into test
// files, and the `redis` mount it would otherwise resolve to points at a real Redis driver
// (see setup/caching.ts) that isn't reachable in tests. Stub it globally (same convention as
// `server/middleware/rate-limiter.test.ts`) with an in-memory stand-in so the write-coordination
// tests below can control timing deterministically.
const mockStorageStore = new Map<string, unknown>();
const mockStorage = {
  getItem: async (key: string) => (mockStorageStore.has(key) ? mockStorageStore.get(key) : null),
  setItem: async (key: string, value: unknown) => {
    mockStorageStore.set(key, value);
  },
  removeItem: async (key: string) => {
    mockStorageStore.delete(key);
  },
  getKeys: async (prefix: string) =>
    [...mockStorageStore.keys()].filter((key) => key.startsWith(prefix)),
};
global.useStorage = vi.fn(() => mockStorage);

function mockResponse<T>(data: T): TinybirdResponse<T> {
  return {
    data,
    meta: [],
    rows: Array.isArray(data) ? data.length : 1,
    rows_before_limit_at_least: 0,
    statistics: { elapsed: 0, rows_read: 0, bytes_read: 0 },
  };
}

describe('clearBucketCache / clearAllBucketCaches — write coordination', () => {
  afterEach(() => {
    delete process.env.NUXT_REDIS_URL;
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('clearBucketCache waits for an already-started project write so no stale value can be read once it resolves', async () => {
    process.env.NUXT_REDIS_URL = 'redis://localhost:6379';
    const { getBucketIdForProject, clearBucketCache } = await import('./bucket-cache');
    const storage = mockStorage;

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

  it('clearAllBucketCaches waits for an already-started project write before clearing', async () => {
    process.env.NUXT_REDIS_URL = 'redis://localhost:6379';
    const { getBucketIdForProject, clearAllBucketCaches } = await import('./bucket-cache');
    const storage = mockStorage;

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
    const lookup = getBucketIdForProject('cncf', fetcher);
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
    const afterClear = await getBucketIdForProject('cncf', freshFetcher);
    expect(afterClear).toBe(5);
  });
});
