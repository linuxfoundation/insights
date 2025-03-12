import type {ContributorsLeaderboardFilter} from "~~/server/data/types";
import {fetchFromTinybird, type TinybirdResponse} from "~~/server/data/tinybird/tinybird";

export type ContributorsLeaderboardDataPoint = {
  avatar: string | undefined; // URL of the user's profile pic or avatar.
  name: string; // Full name of the contributor
  contributions: number; // Total number of contributions
  contributionValue: number; // Value of the contribution
  contributionPercentage: number;
}
export type ContributorsLeaderboardData = ContributorsLeaderboardDataPoint[];
export type ContributorsLeaderboardResponse = {
  meta: {
    offset: number;
    limit: number;
    total: number;
  },
  data: ContributorsLeaderboardData
}

type TinybirdContributorsLeaderboardData = {
  avatar: string,
  displayName: string,
  contributionCount: number,
  contributionPercentage: number
}[];

export async function fetchContributorsLeaderboard(
  filter: ContributorsLeaderboardFilter
): Promise<ContributorsLeaderboardResponse> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const contributorsLeaderboardQuery = {
    repository: filter.repository,
    limit: filter.limit,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const data = await fetchFromTinybird<TinybirdContributorsLeaderboardData>(
    '/v0/pipes/contributors_leaderboard.json',
    contributorsLeaderboardQuery
  );

  let processedData: ContributorsLeaderboardData = [];
  if (data !== undefined) {
    processedData = (data as TinybirdResponse<TinybirdContributorsLeaderboardData>)?.data.map(
      (item): ContributorsLeaderboardDataPoint => ({
        avatar: item.avatar,
        name: item.displayName,
        contributions: item.contributionCount,
        contributionValue: 0,
        contributionPercentage: item.contributionPercentage
      })
    );
  }

  return {
    meta: {
      offset: 0,
      limit: 10,
      total: data.rows
    },
    data: processedData
  };
}
