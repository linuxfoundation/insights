// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { OrganizationProfile } from '~~/types/organization-page';

interface TinybirdOrgProfile {
  id: string;
  displayName: string;
  logo: string;
  employeeCount: string;
  industry: string;
  description: string;
  website: string;
  domain: string;
}

export default defineEventHandler(async (event): Promise<OrganizationProfile> => {
  const orgSlug = getRouterParam(event, 'orgSlug');

  if (!orgSlug) {
    throw createError({ statusCode: 422, statusMessage: 'orgSlug is required' });
  }

  try {
    const res = await fetchFromTinybird<TinybirdOrgProfile[]>('/v0/pipes/org_page_profile.json', {
      orgSlug,
    });

    if (!res.data?.length) {
      throw createError({ statusCode: 404, statusMessage: 'Organization not found' });
    }

    const raw = res.data[0];
    return {
      id: raw.id,
      displayName: raw.displayName,
      logo: raw.logo,
      description: raw.description,
      employeeCount: raw.employeeCount ?? undefined,
      industry: raw.industry
        ? raw.industry
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      website: raw.website || undefined,
      domain: raw.domain || undefined,
    };
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
