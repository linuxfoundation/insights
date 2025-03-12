import type {OrganizationsLeaderboardFilter} from "~~/server/data/types";
import {fetchFromTinybird, type TinybirdResponse} from "~~/server/data/tinybird/tinybird";

export type OrganizationsLeaderboardDataPoint = {
  logo: string | undefined; // URL of the user's profile pic or avatar.
  name: string; // Full name of the organization
  contributions: number; // Total number of contributions
  contributionValue: number; // Value of the contribution
  contributionPercentage: number;
  website: string; // We don't seem to have this at the moment
}
export type OrganizationsLeaderboardData = OrganizationsLeaderboardDataPoint[];
export type OrganizationsLeaderboardResponse = {
  meta: {
    offset: number;
    limit: number;
    total: number;
  },
  data: OrganizationsLeaderboardData
}

type TinybirdOrganizationsLeaderboardData = {
  logo: string,
  displayName: string,
  contributionCount: number,
  contributionPercentage: number
}[];

export async function fetchOrganizationsLeaderboard(
  filter: OrganizationsLeaderboardFilter
): Promise<OrganizationsLeaderboardResponse> {
  // TODO: We're passing unchecked query parameters to TinyBird directly from the frontend.
  //  We need to ensure this doesn't pose a security risk.

  const organizationsLeaderboardQuery = {
    repository: filter.repository,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  const endpoint = '/v0/pipes/organizations_leaderboard.json';
  const data = await fetchFromTinybird<TinybirdOrganizationsLeaderboardData>(endpoint, organizationsLeaderboardQuery);

  let processedData: OrganizationsLeaderboardData = [];
  if (data !== undefined) {
    processedData = (data as TinybirdResponse<TinybirdOrganizationsLeaderboardData>)?.data.map(
      (item): OrganizationsLeaderboardDataPoint => ({
        logo: item.logo,
        name: item.displayName,
        contributions: item.contributionCount,
        contributionValue: 0,
        contributionPercentage: item.contributionPercentage,
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
