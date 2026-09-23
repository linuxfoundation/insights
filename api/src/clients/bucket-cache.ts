// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { BucketCacheStorage } from '@lfx-insights/tinybird-client';

interface Entry {
  value: number;
  expiresAt: number;
}

// One map per process: a project's bucket is resolved once per instance instead of once per
// request. The frontend's Redis adapter (frontend/server/data/tinybird/tinybird.ts) is the
// multi-instance version.
export function createInMemoryBucketCache(now: () => number = Date.now): BucketCacheStorage {
  const entries = new Map<string, Entry>();

  const live = (key: string): Entry | undefined => {
    const entry = entries.get(key);
    if (entry && entry.expiresAt <= now()) {
      entries.delete(key);
      return undefined;
    }
    return entry;
  };

  return {
    async getItem(key) {
      return live(key)?.value ?? null;
    },
    async setItem(key, value, options) {
      const ttl = options?.ttl;
      entries.set(key, { value, expiresAt: ttl === undefined ? Infinity : now() + ttl * 1000 });
    },
    async removeItem(key) {
      entries.delete(key);
    },
    async getKeys(prefix) {
      return [...entries.keys()].filter((key) => key.startsWith(prefix) && live(key));
    },
  };
}
