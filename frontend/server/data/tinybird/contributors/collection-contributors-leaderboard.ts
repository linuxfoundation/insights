// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { CollectionContributorsLeaderboardFilter } from '~~/server/data/types';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type {
  TinybirdContributorsLeaderboardData,
  TinybirdCountData,
} from '~~/server/data/tinybird/responses.types';
import type { Contributor, ContributorLeaderboard } from '~~/types/contributors/responses.types';
import type { CollectionContributorsLeaderboardTinybirdQuery } from '~~/server/data/tinybird/requests.types';

// Collection-scoped counterpart to fetchContributorsLeaderboard (contributors-leaderboard.ts) -
// calls the separate, performance-optimized collection_contributors_leaderboard pipe instead of
// contributors_leaderboard, since a naive collection-scoped port of the single-project pipe's
// window-function percentage calculation timed out at collection scale. See that pipe's
// DESCRIPTION for the full story.
export async function fetchCollectionContributorsLeaderboard(
  filter: CollectionContributorsLeaderboardFilter,
): Promise<ContributorLeaderboard> {
  const dataQuery: CollectionContributorsLeaderboardTinybirdQuery = {
    collectionSlug: filter.collectionSlug,
    platform: filter.platform,
    activity_type: filter.activity_type,
    includeCollaborations: filter.includeCollaborations,
    repos: filter.repos,
    limit: filter.limit,
    offset: filter.offset,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const countQuery: CollectionContributorsLeaderboardTinybirdQuery = {
    collectionSlug: filter.collectionSlug,
    platform: filter.platform,
    activity_type: filter.activity_type,
    includeCollaborations: filter.includeCollaborations,
    repos: filter.repos,
    startDate: filter.startDate,
    endDate: filter.endDate,
    count: true,
  };

  const [dataResponse, countResponse] = await Promise.all([
    fetchFromTinybird<TinybirdContributorsLeaderboardData[]>(
      '/v0/pipes/collection_contributors_leaderboard.json',
      dataQuery,
    ),
    fetchFromTinybird<TinybirdCountData[]>(
      '/v0/pipes/collection_contributors_leaderboard.json',
      countQuery,
    ),
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
        githubHandleArray: item.githubHandleArray,
      }),
    ),
  };
}
