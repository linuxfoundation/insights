import type {
  OrganizationDependencyFilter,
  OrganizationsLeaderboardFilter,
} from "../types";
import {FilterActivityMetric} from "../types";
import {fetchFromTinybird} from './tinybird'
import type {OrganizationsLeaderboardDataPoint} from "~~/server/data/tinybird/organizations-leaderboard-source";
import {fetchOrganizationsLeaderboard} from "~~/server/data/tinybird/organizations-leaderboard-source";

export type OrganizationDependencyDataPoint = {
  logo: string | undefined;
  name: string;
  contributions: number;
  percentage: number;
  website: string;
};
export type OrganizationDependencyResponse = {
  topOrganizations: {
    count: number;
    percentage: number;
  },
  otherOrganizations: {
    count: number;
    percentage: number;
  },
  list: OrganizationDependencyDataPoint[]
};

type TinybirdOrganizationDependencyData = {
  displayName: string,
  contributionPercentage: number,
  contributionPercentageRunningTotal: number,
  totalOrganizationCount: number
}[];

export async function fetchOrganizationDependency(filter: OrganizationDependencyFilter) {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const leaderboardFilter: OrganizationsLeaderboardFilter = {
    metric: (filter.metric as FilterActivityMetric) || FilterActivityMetric.ALL,
    repository: filter.repository,
    limit: 5,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const [tinybirdTopOrganizationsResponse, tinybirdLeaderboardResponse] = await Promise.all([
    fetchFromTinybird<TinybirdOrganizationDependencyData>('/v0/pipes/organization_dependency.json', filter),
    fetchOrganizationsLeaderboard(leaderboardFilter)
  ]);

  const topOrganizationsCount = tinybirdTopOrganizationsResponse.data.length;
  const topOrganizationsPercentage = tinybirdTopOrganizationsResponse.data[topOrganizationsCount - 1].contributionPercentageRunningTotal;
  const {totalOrganizationCount} = tinybirdTopOrganizationsResponse.data[0];

  const response: OrganizationDependencyResponse = {
    topOrganizations: {
      count: topOrganizationsCount,
      percentage: topOrganizationsPercentage
    },
    otherOrganizations: {
      count: totalOrganizationCount - topOrganizationsCount,
      percentage: 100 - topOrganizationsPercentage
    },
    list: convertLeaderboardData(tinybirdLeaderboardResponse.data)
  };

  return response;
}

function convertLeaderboardData(leaderboard: OrganizationsLeaderboardDataPoint[]): OrganizationDependencyDataPoint[] {
  return leaderboard.map((item) => ({
    logo: item.logo,
    name: item.name,
    contributions: item.contributions,
    percentage: item.contributionPercentage,
    website: item.website || '' // We don't seem to have this at the moment
  }));
}
