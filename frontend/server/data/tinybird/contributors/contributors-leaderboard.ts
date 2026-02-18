// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ContributorsLeaderboardFilter } from '~~/server/data/types';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type {
  TinybirdContributorsLeaderboardData,
  TinybirdCountData,
} from '~~/server/data/tinybird/responses.types';
import type { Contributor, ContributorLeaderboard } from '~~/types/contributors/responses.types';
import type { ContributorsLeaderboardTinybirdQuery } from '~~/server/data/tinybird/requests.types';

export async function fetchContributorsLeaderboard(
  filter: ContributorsLeaderboardFilter,
): Promise<ContributorLeaderboard> {
  const dataQuery: ContributorsLeaderboardTinybirdQuery = {
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

  const countQuery: ContributorsLeaderboardTinybirdQuery = {
    project: filter.project,
    platform: filter.platform,
    activity_type: filter.activity_type,
    includeCodeContributions: filter.includeCodeContributions,
    includeCollaborations: filter.includeCollaborations,
    repos: filter.repos,
    startDate: filter.startDate,
    endDate: filter.endDate,
    count: true,
  };

  const [dataResponse, countResponse] = await Promise.all([
    fetchFromTinybird<TinybirdContributorsLeaderboardData[]>(
      '/v0/pipes/contributors_leaderboard.json',
      dataQuery,
    ),
    fetchFromTinybird<TinybirdCountData[]>('/v0/pipes/contributors_leaderboard.json', countQuery),
  ]);

  return {
    meta: {
      offset: filter.offset || 0,
      limit: filter.limit || 10,
      total: countResponse?.data?.[0]?.count || 0,
    },
    data: dataResponse.data.map(
      (item): Contributor => ({
        avatar: item.avatar,
        name: item.displayName,
        contributions: item.contributionCount,
        percentage: item.contributionPercentage,
        roles: item.roles || [],
        githubHandle: item.githubHandle,
        githubHandleArray: item.githubHandleArray,
      }),
    ),
  };
}
