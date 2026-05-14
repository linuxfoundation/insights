// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// Shim: delegates to the shared client instance created in tinybird.ts.
// The bucket-cache logic lives in @lfx-insights/tinybird-client.
import type { TinybirdResponse } from '@lfx-insights/tinybird-client';
import { fetchFromTinybird } from './tinybird';

type Fetcher = <T>(
  path: string,
  query: Record<string, string | number | boolean | string[] | undefined | null>,
) => Promise<TinybirdResponse<T>>;

// Re-export the signature expected by legacy call sites that pass their own fetcher.
// The implementation now delegates to the client in tinybird.ts.
export async function getBucketIdForProject(
  project: string,
  _fetcher?: Fetcher,
): Promise<number | null> {
  // The client-level bucket cache handles caching and in-flight deduplication.
  // The injected _fetcher argument is ignored — it was only needed when the cache
  // lived outside the client and required a circular-dep workaround.
  const result = await fetchFromTinybird<{ bucketId: number }[]>('/v0/pipes/project_buckets.json', {
    project,
  });
  const bucketId = result.data[0]?.bucketId;
  return typeof bucketId === 'number' ? bucketId : null;
}
