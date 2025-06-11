// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { ExploreOrganizations } from '~~/types/explore/organizations';
import type { Pagination } from '~~/types/shared/pagination';

export default defineEventHandler(
  async (event): Promise<Pagination<ExploreOrganizations> | Error> => {
    const query = getQuery(event);
    // Pagination parameters
    const page: number = +(query?.page ?? 0);
    const pageSize: number = +(query?.pageSize ?? 10);
    try {
      const res = await fetchFromTinybird<ExploreOrganizations[]>(
        '/v0/pipes/top_active_organizations.json',
        {
          page,
          pageSize,
        }
      );

      //   type OrganizationCount = { 'count(id)': number };
      //   const organizationCountResult = await fetchFromTinybird<OrganizationCount[]>(
      //     '/v0/pipes/top_active_organizations.json',
      //     {
      //       count: true,
      //     }
      //   );
      //   TODO: implement total count
      return {
        page,
        pageSize,
        total: 100, // organizationCountResult.data[0]?.['count(id)'] || 0,
        data: res.data,
      };
    } catch (err) {
      console.error('Error fetching top active organizations:', err);
      return createError({ statusCode: 500, statusMessage: 'Internal server error' });
    }
  }
);
