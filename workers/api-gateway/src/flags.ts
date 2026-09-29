// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Env } from './env';
import type { OrgTier } from './tiers';

export const ADMIN_ORG_TIER: OrgTier = { orgId: 'lfx-admin', tier: 'admin' };

const REFRESH_MS = 60_000;

interface Target {
  values: string[];
  variation: number;
  contextKind?: string;
}

export interface FlagConfig {
  on: boolean;
  variations: unknown[];
  targets?: Target[];
  contextTargets?: Target[];
}

let cached: { usernames: string[]; fetchedAt: number } | undefined;

export function targetedUsernames(flag: FlagConfig): string[] {
  if (!flag.on) return [];
  const targets = [
    ...(flag.targets ?? []),
    ...(flag.contextTargets ?? []).filter((t) => (t.contextKind ?? 'user') === 'user'),
  ];
  return targets.filter((t) => flag.variations[t.variation] === true).flatMap((t) => t.values);
}

export async function fetchAdminUsernames(env: Env): Promise<string[]> {
  if (cached && Date.now() - cached.fetchedAt < REFRESH_MS) return cached.usernames;
  try {
    const response = await fetch(env.LD_FLAG_URL, { headers: { authorization: env.LD_SDK_KEY } });
    if (!response.ok) throw new Error(`LaunchDarkly flag request failed: ${response.status}`);
    cached = { usernames: targetedUsernames(await response.json()), fetchedAt: Date.now() };
    return cached.usernames;
  } catch (error) {
    console.error(error);
    return cached?.usernames ?? [];
  }
}
