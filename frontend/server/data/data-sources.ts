// This creates a Tinybird data source for fetching active contributors' data.
// If we ever need to change the data source, we can do it here, and we won't have to change the API code.

import type {
  ActiveContributorsFilter,
  ActiveOrganizationsFilter,
  ContributorsLeaderboardFilter,
  OrganizationsLeaderboardFilter,
  ContributorDependencyFilter
} from "~~/server/data/types";
import type {ActiveContributorsResponse} from "~~/server/data/tinybird/active-contributors-data-source";
import type {ActiveOrganizationsResponse} from "~~/server/data/tinybird/active-organizations-data-source";
import type {ContributorsLeaderboardResponse} from "~~/server/data/tinybird/contributors-leaderboard-source";
import type {OrganizationsLeaderboardResponse} from "~~/server/data/tinybird/organizations-leaderboard-source";
import type {ContributorDependencyResponse} from "~~/server/data/tinybird/contributors-dependency-data-source";
import {fetchActiveContributors} from "~~/server/data/tinybird/active-contributors-data-source";
import {fetchActiveOrganizations} from "~~/server/data/tinybird/active-organizations-data-source";
import {fetchContributorsLeaderboard} from "~~/server/data/tinybird/contributors-leaderboard-source";
import {fetchOrganizationsLeaderboard} from "~~/server/data/tinybird/organizations-leaderboard-source";
import {fetchContributorDependency} from "~~/server/data/tinybird/contributors-dependency-data-source";

export interface DataSource {
    fetchActiveContributors: (filter: ActiveContributorsFilter) => Promise<ActiveContributorsResponse>;
    fetchActiveOrganizations: (filter: ActiveOrganizationsFilter) => Promise<ActiveOrganizationsResponse>;
    fetchContributorsLeaderboard: (filter: ContributorsLeaderboardFilter) => Promise<ContributorsLeaderboardResponse>;
    fetchOrganizationsLeaderboard: (filter: OrganizationsLeaderboardFilter) => Promise<OrganizationsLeaderboardResponse>;
    fetchContributorDependency: (filter: ContributorDependencyFilter) => Promise<ContributorDependencyResponse>;
}

export function createDataSource(): DataSource {
    return {
        fetchActiveContributors,
        fetchContributorsLeaderboard,
        fetchActiveOrganizations,
        fetchOrganizationsLeaderboard,
        fetchContributorDependency
    };
}
