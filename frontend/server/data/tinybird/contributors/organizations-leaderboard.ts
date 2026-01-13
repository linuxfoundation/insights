// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { OrganizationsLeaderboardFilter } from '~~/server/data/types';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type {
  TinybirdCountData,
  TinybirdOrganizationsLeaderboardData,
} from '~~/server/data/tinybird/responses.types';
import type { Organization, OrganizationLeaderboard } from '~~/types/contributors/responses.types';
import type { OrganizationsLeaderboardTinybirdQuery } from '~~/server/data/tinybird/requests.types';

export async function fetchOrganizationsLeaderboard(
  filter: OrganizationsLeaderboardFilter,
): Promise<OrganizationLeaderboard> {
  const dataQuery: OrganizationsLeaderboardTinybirdQuery = {
    project: filter.project,
    platform: filter.platform,
    activity_type: filter.activity_type,
    includeCodeContributions: filter.includeCodeContributions,
    includeCollaborations: filter.includeCollaborations,
    repos: filter.repos,
    limit: filter.limit,
    offset: filter.offset,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const countQuery = {
    ...dataQuery,
    count: true,
  };

  const path = '/v0/pipes/organizations_leaderboard.json';
  const [dataResponse, countResponse] = await Promise.all([
    await fetchFromTinybird<TinybirdOrganizationsLeaderboardData[]>(path, dataQuery),
    await fetchFromTinybird<TinybirdCountData[]>(path, countQuery),
  ]);

  return {
    meta: {
      offset: filter.offset || 0,
      limit: filter.limit || 10,
      total: countResponse?.data[0].count || 0,
    },
    data: dataResponse.data.map(
      (item): Organization => ({
        logo: item.logo,
        name: item.displayName,
        contributions: item.contributionCount,
        percentage: item.contributionPercentage,
        website: '', // We don't seem to have this at the moment
      }),
    ),
  };
}
