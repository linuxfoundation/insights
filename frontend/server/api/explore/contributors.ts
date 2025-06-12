// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { ExploreContributors } from '~~/types/explore/contributors';

export default defineEventHandler(async (event): Promise<ExploreContributors[] | Error> => {
  const query = getQuery(event);
  // Pagination parameters
  const page: number = +(query?.page ?? 0);
  const pageSize: number = +(query?.pageSize ?? 10);
  try {
    const res = await fetchFromTinybird<ExploreContributors[]>(
      '/v0/pipes/top_active_contributors.json',
      {
        page,
        pageSize,
      }
    );

    //   TODO: implement total count
    return res.data;
  } catch (err) {
    console.error('Error fetching top active contributors:', err);
    return createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
