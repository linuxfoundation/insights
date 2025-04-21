import type {ContributorsLeaderboardFilter} from "~~/server/data/types";
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {TinybirdContributorsLeaderboardData} from "~~/server/data/tinybird/responses.types";
import type {Contributor, ContributorLeaderboard} from "~~/types/contributors/responses.types";

export async function fetchContributorsLeaderboard(
  filter: ContributorsLeaderboardFilter
): Promise<ContributorLeaderboard> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const tbResponse = await fetchFromTinybird<TinybirdContributorsLeaderboardData[]>(
    '/v0/pipes/contributors_leaderboard.json',
    filter
  );

  return {
    meta: {
      offset: 0,
      limit: 10,
      total: tbResponse?.rows || 0
    },
    data: tbResponse.data.map(
      (item): Contributor => ({
        avatar: item.avatar,
        name: item.displayName,
        contributions: item.contributionCount,
        percentage: item.contributionPercentage,
      })
    )
  };
}
