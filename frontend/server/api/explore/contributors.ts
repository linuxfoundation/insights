// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pagination } from '~~/types/shared/pagination';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { ExploreContributors } from '~~/types/explore/contributors';

export default defineEventHandler(
  async (event): Promise<Pagination<ExploreContributors> | Error> => {
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

      //   type ContributorCount = { 'count(id)': number };
      //   const contributorCountResult = await fetchFromTinybird<ContributorCount[]>(
      //     '/v0/pipes/top_active_contributors.json',
      //     {
      //       count: true,
      //     }
      //   );
      //   TODO: implement total count
      return {
        page,
        pageSize,
        total: 100, // contributorCountResult.data[0]?.['count(id)'] || 0,
        data: res.data,
      };
    } catch (err) {
      console.error('Error fetching top active contributors:', err);
      return createError({ statusCode: 500, statusMessage: 'Internal server error' });
    }
  }
);
