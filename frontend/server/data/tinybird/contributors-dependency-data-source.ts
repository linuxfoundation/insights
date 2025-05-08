// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {ContributorDependencyFilter, ContributorsLeaderboardFilter,} from "../types";
import {fetchFromTinybird} from './tinybird'
import {fetchContributorsLeaderboard} from "~~/server/data/tinybird/contributors-leaderboard-data-source";
import type {TinybirdContributorDependencyData} from "~~/server/data/tinybird/responses.types";
import type {ContributorDependency} from "~~/types/contributors/responses.types";

export async function fetchContributorDependency(filter: ContributorDependencyFilter): Promise<ContributorDependency> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const leaderboardFilter: ContributorsLeaderboardFilter = {
    ...filter,
    limit: 5
  };

  const [tinybirdTopContributorsResponse, tinybirdLeaderboardResponse] = await Promise.all([
    fetchFromTinybird<TinybirdContributorDependencyData[]>('/v0/pipes/contributor_dependency.json', filter),
    fetchContributorsLeaderboard(leaderboardFilter)
  ]);

  const topContributorsCount = tinybirdTopContributorsResponse.data.length;
  const lastContributor = tinybirdTopContributorsResponse.data.at(-1);
  const topContributorsPercentage = lastContributor?.contributionPercentageRunningTotal || 0;
  const totalContributorCount = tinybirdTopContributorsResponse.data[0]?.totalContributorCount || 0;

  return {
    topContributors: {
      count: topContributorsCount,
      percentage: topContributorsPercentage
    },
    otherContributors: {
      count: Math.max(0, (totalContributorCount || 0) - topContributorsCount),
      percentage: 100 - topContributorsPercentage
    },
    list: tinybirdLeaderboardResponse.data.map((item) => ({
      avatar: item.avatar,
      name: item.name,
      contributions: item.contributions,
      percentage: item.percentage
    }))
  };
}
