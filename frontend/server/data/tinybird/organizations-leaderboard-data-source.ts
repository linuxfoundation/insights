import type {OrganizationsLeaderboardFilter} from "~~/server/data/types";
import {fetchFromTinybird, type TinybirdResponse} from "~~/server/data/tinybird/tinybird";
import type {TinybirdOrganizationsLeaderboardData} from "~~/server/data/tinybird/responses.types";
import type {Organization, OrganizationLeaderboard} from "~~/types/contributors/responses.types";

export async function fetchOrganizationsLeaderboard(
  filter: OrganizationsLeaderboardFilter
): Promise<OrganizationLeaderboard> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const endpoint = '/v0/pipes/organizations_leaderboard.json';
  const data = await fetchFromTinybird<TinybirdOrganizationsLeaderboardData[]>(endpoint, filter);

  let processedData: Organization[] = [];
  if (data !== undefined) {
    processedData = (data as TinybirdResponse<TinybirdOrganizationsLeaderboardData[]>)?.data.map(
      (item): Organization => ({
        logo: item.logo,
        name: item.displayName,
        contributions: item.contributionCount,
        percentage: item.contributionPercentage,
        website: '' // We don't seem to have this at the moment
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
