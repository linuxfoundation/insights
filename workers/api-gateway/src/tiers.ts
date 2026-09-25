// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Env } from './env';
import { m2mToken } from './m2m';

export interface MemberOrgTier {
  b2b_org_uid: string;
  membership_uid: string;
  tier: string;
  company_name?: string;
  project_slug?: string;
  tier_name?: string;
  status?: string;
}

export interface OrgTier {
  orgId: string;
  tier: string;
}

export async function fetchMemberTiers(username: string, env: Env): Promise<MemberOrgTier[]> {
  const url = new URL(`b2b_orgs/member-tiers/${encodeURIComponent(username)}?v=1`, env.LFX_API_URL);
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${await m2mToken(env)}` },
  });
  if (!response.ok) throw new Error(`member-tiers request failed: ${response.status}`);
  return (await response.json()) as MemberOrgTier[];
}

export function pickOrgTier(tiers: MemberOrgTier[]): OrgTier | null {
  const [top] = tiers;
  return top ? { orgId: top.b2b_org_uid, tier: top.tier } : null;
}
