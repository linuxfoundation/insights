import type {
  ContributorDependencyFilter,
  ContributorsLeaderboardFilter,
} from "../types";
import {FilterActivityMetric} from "../types";
import {fetchFromTinybird} from './tinybird'
import type {ContributorsLeaderboardDataPoint} from "~~/server/data/tinybird/contributors-leaderboard-source";
import {fetchContributorsLeaderboard} from "~~/server/data/tinybird/contributors-leaderboard-source";

export type ContributorDependencyDataPoint = {
  avatar: string | undefined;
  name: string;
  contributions: number;
  percentage: number;
};
export type ContributorDependencyResponse = {
  topContributors: {
    count: number;
    percentage: number;
  },
  otherContributors: {
    count: number;
    percentage: number;
  },
  list: ContributorDependencyDataPoint[]
};

type TinybirdContributorDependencyData = {
  displayName: string,
  contributionPercentage: number,
  contributionPercentageRunningTotal: number,
  totalContributorCount: number
}[];

export async function fetchContributorDependency(filter: ContributorDependencyFilter) {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const leaderboardFilter: ContributorsLeaderboardFilter = {
    metric: (filter.metric as FilterActivityMetric) || FilterActivityMetric.ALL,
    repository: filter.repository,
    limit: 5,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const [tinybirdTopContributorsResponse, tinybirdLeaderboardResponse] = await Promise.all([
    fetchFromTinybird<TinybirdContributorDependencyData>('/v0/pipes/contributor_dependency.json', filter),
    fetchContributorsLeaderboard(leaderboardFilter)
  ]);

  const topContributorsCount = tinybirdTopContributorsResponse.data.length;
  const topContributorsPercentage = tinybirdTopContributorsResponse.data[topContributorsCount - 1].contributionPercentageRunningTotal;
  const {totalContributorCount} = tinybirdTopContributorsResponse.data[0];

  const response: ContributorDependencyResponse = {
    topContributors: {
      count: topContributorsCount,
      percentage: topContributorsPercentage
    },
    otherContributors: {
      count: totalContributorCount - topContributorsCount,
      percentage: 100 - topContributorsPercentage
    },
    list: convertLeaderboardData(tinybirdLeaderboardResponse.data)
  };

  return response;
}

function convertLeaderboardData(leaderboard: ContributorsLeaderboardDataPoint[]): ContributorDependencyDataPoint[] {
  return leaderboard.map((item) => ({
    avatar: item.avatar,
    name: item.name,
    contributions: item.contributions,
    percentage: item.contributionPercentage
  }));
}
