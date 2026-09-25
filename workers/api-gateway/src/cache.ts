// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { OrgTier } from './tiers';

export const ENTITLEMENT_TTL_SECONDS = 600;

export interface Entitlement {
  accessToken: string;
  orgTier: OrgTier | null;
}

export interface EntitlementCache {
  get(key: string): Promise<Entitlement | undefined>;
  put(key: string, value: Entitlement, ttlSeconds: number): Promise<void>;
}

export function edgeCache(): EntitlementCache {
  const url = (key: string) => `https://entitlements.internal/${key}`;
  return {
    async get(key) {
      const hit = await caches.default.match(url(key));
      return hit ? ((await hit.json()) as Entitlement) : undefined;
    },
    async put(key, value, ttlSeconds) {
      const response = new Response(JSON.stringify(value), {
        headers: { 'cache-control': `max-age=${ttlSeconds}` },
      });
      await caches.default.put(url(key), response);
    },
  };
}
