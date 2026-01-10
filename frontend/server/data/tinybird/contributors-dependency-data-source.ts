// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { ContributorDependencyFilter, ContributorsLeaderboardFilter } from '../types';
import { fetchFromTinybird } from './tinybird';
import { fetchContributorsLeaderboard } from '~~/server/data/tinybird/contributors-leaderboard-data-source';
import type { TinybirdContributorDependencyData } from '~~/server/data/tinybird/responses.types';
import type { ContributorDependency } from '~~/types/contributors/responses.types';

export async function fetchContributorDependency(
  filter: ContributorDependencyFilter,
): Promise<ContributorDependency> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const dependencyQuery: ContributorDependencyFilter = {
    ...filter,
    // We need to request from TinyBird a higher limit of contributors than the default of 10,
    // because, when summing the contribution percentages, we want to get to at least 51%,
    // but sometimes only 10 contributors don't add up to that percentage.
    // By bumping up that limit to 100, it's almost guaranteed we will get to 51%.
    limit: 100,
  };
  const leaderboardQuery: ContributorsLeaderboardFilter = {
    ...filter,
    limit: 5,
  };

  const [tinybirdTopContributorsResponse, tinybirdLeaderboardResponse] = await Promise.all([
    fetchFromTinybird<TinybirdContributorDependencyData[]>(
      '/v0/pipes/contributor_dependency.json',
      dependencyQuery,
    ),
    fetchContributorsLeaderboard(leaderboardQuery),
  ]);

  // Sort the top contributors by contributionPercentageRunningTotal in ascending order.
  // We do this here because TinyBird is failing to sort the data correctly for some reason.
  // We get the topContributorsPercentage from the top contributors from the last item in the results (lastContributor),
  // so if those are not correctly sorted, we would get the wrong value.
  // Once we figure out the TinyBird issue, we can remove this sorting from here.
  tinybirdTopContributorsResponse.data.sort((a, b) => {
    if (a.contributionPercentageRunningTotal < b.contributionPercentageRunningTotal) {
      return -1;
    }
    if (a.contributionPercentageRunningTotal > b.contributionPercentageRunningTotal) {
      return 1;
    }
    return 0;
  });

  const topContributorsCount = tinybirdTopContributorsResponse.data.length;
  const lastContributor = tinybirdTopContributorsResponse.data.at(-1);
  const topContributorsPercentage = lastContributor?.contributionPercentageRunningTotal || 0;
  const totalContributorCount = tinybirdTopContributorsResponse.data[0]?.totalContributorCount || 0;

  return {
    topContributors: {
      count: topContributorsCount,
      percentage: topContributorsPercentage,
    },
    otherContributors: {
      count: Math.max(0, (totalContributorCount || 0) - topContributorsCount),
      percentage: 100 - topContributorsPercentage,
    },
    list: tinybirdLeaderboardResponse.data.map((item) => ({
      avatar: item.avatar,
      name: item.name,
      contributions: item.contributions,
      percentage: item.percentage,
      roles: item.roles || [],
      githubHandle: item.githubHandle,
    })),
  };
}
