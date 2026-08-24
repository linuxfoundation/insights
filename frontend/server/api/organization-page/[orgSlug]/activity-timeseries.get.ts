// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { OrgActivityTimeseries } from '~~/types/organization-page';

export default defineEventHandler(async (event): Promise<OrgActivityTimeseries[]> => {
  const orgSlug = getRouterParam(event, 'orgSlug');

  if (!orgSlug) {
    throw createError({ statusCode: 422, statusMessage: 'orgSlug is required' });
  }

  try {
    const res = await fetchFromTinybird<OrgActivityTimeseries[]>(
      '/v0/pipes/org_page_activities_timeseries.json',
      { orgSlug },
    );

    return res.data ?? [];
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
