// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { OrgContributor } from '~~/types/organization-page';

interface TinybirdContributor {
  id: string;
  avatar: string;
  displayName: string;
  githubHandleArray: string;
  contributionCount: number;
  contributionPercentage: number;
  roles: string;
}

export default defineEventHandler(async (event): Promise<OrgContributor[]> => {
  const orgId = getRouterParam(event, 'orgId');

  if (!orgId) {
    throw createError({ statusCode: 422, statusMessage: 'orgId is required' });
  }

  try {
    const res = await fetchFromTinybird<TinybirdContributor[]>(
      '/v0/pipes/org_page_contributors.json',
      { orgId },
    );

    return (res.data ?? []).map((c) => ({
      id: c.id,
      name: c.displayName,
      avatar: c.avatar,
      contributions: c.contributionCount,
      roles: parseRolesArray(c.roles),
    }));
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});

// Tinybird returns roles as a ClickHouse Array string e.g. "['maintainer','owner']"
function parseRolesArray(raw: string): string[] {
  if (!raw || raw === '[]') return [];
  return raw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.trim().replace(/^'|'$/g, ''))
    .filter(Boolean);
}
