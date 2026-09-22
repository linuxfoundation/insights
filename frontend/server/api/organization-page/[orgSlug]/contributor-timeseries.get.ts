// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import { logError } from '~~/server/utils/log';
import type { OrgContributorTimeseries } from '~~/types/organization-page';

export default defineEventHandler(async (event): Promise<OrgContributorTimeseries[]> => {
  const orgSlug = getRouterParam(event, 'orgSlug');

  if (!orgSlug) {
    throw createError({ statusCode: 422, statusMessage: 'orgSlug is required' });
  }

  try {
    const res = await fetchFromTinybird<OrgContributorTimeseries[]>(
      '/v0/pipes/org_page_contributors_timeseries.json',
      { orgSlug },
    );

    return res.data ?? [];
  } catch (error: any) {
    if (error?.statusCode) throw error;
    logError(
      'organization-page/contributor-timeseries',
      'Failed to fetch organization contributor timeseries',
      error,
    );
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
