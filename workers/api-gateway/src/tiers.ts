// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Env } from './env';

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

export async function fetchMemberTiers(_username: string, _env: Env): Promise<MemberOrgTier[]> {
  return [
    {
      b2b_org_uid: '001B000000IqhSLIAZ',
      membership_uid: '02i2M000009ABCdIAM',
      tier: 'gold',
      company_name: 'Example Corp',
      project_slug: 'lf-main',
      tier_name: 'Gold Corporate Membership',
      status: 'Active',
    },
  ];
}

export function pickOrgTier(tiers: MemberOrgTier[]): OrgTier | null {
  const [top] = tiers;
  return top ? { orgId: top.b2b_org_uid, tier: top.tier } : null;
}
