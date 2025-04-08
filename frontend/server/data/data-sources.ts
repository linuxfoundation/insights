// This creates a Tinybird data source for fetching active contributors' data.
// If we ever need to change the data source, we can do it here, and we won't have to change the API code.

import type {
  ActiveContributorsFilter,
  ActiveOrganizationsFilter,
  ContributorsLeaderboardFilter,
  OrganizationsLeaderboardFilter,
  ContributorDependencyFilter,
  OrganizationDependencyFilter,
  GeographicDistributionFilter,
  RetentionFilter,
  ActivityCountFilter,
} from "~~/server/data/types";
import type {ActiveContributorsResponse} from "~~/server/data/tinybird/active-contributors-data-source";
import type {ActiveOrganizationsResponse} from "~~/server/data/tinybird/active-organizations-data-source";
import type {ContributorsLeaderboardResponse} from "~~/server/data/tinybird/contributors-leaderboard-source";
import type {OrganizationsLeaderboardResponse} from "~~/server/data/tinybird/organizations-leaderboard-source";
import type {ContributorDependencyResponse} from "~~/server/data/tinybird/contributors-dependency-data-source";
import type {OrganizationDependencyResponse} from "~~/server/data/tinybird/organizations-dependency-data-source";
import type {GeographicDistributionResponse} from "~~/server/data/tinybird/geographic-distribution-data-source";
import type {RetentionResponse} from "~~/server/data/tinybird/retention-data-source";
import {fetchActiveContributors} from "~~/server/data/tinybird/active-contributors-data-source";
import {fetchActiveOrganizations} from "~~/server/data/tinybird/active-organizations-data-source";
import {fetchContributorsLeaderboard} from "~~/server/data/tinybird/contributors-leaderboard-source";
import {fetchOrganizationsLeaderboard} from "~~/server/data/tinybird/organizations-leaderboard-source";
import {fetchContributorDependency} from "~~/server/data/tinybird/contributors-dependency-data-source";
import {fetchOrganizationDependency} from "~~/server/data/tinybird/organizations-dependency-data-source";
import {fetchGeographicDistribution} from "~~/server/data/tinybird/geographic-distribution-data-source";
import {fetchRetention} from "~~/server/data/tinybird/retention-data-source";
import {fetchForksActivities} from "~~/server/data/tinybird/forks-data-source";
import {fetchStarsActivities} from "~~/server/data/tinybird/stars-data-source";
import {fetchIssuesResolution} from "~~/server/data/tinybird/issues-resolution-data-source";
import {fetchPullRequests} from "~~/server/data/tinybird/pull-requests-data-source";
import type {ForksData, StarsData} from "~~/types/popularity/responses.types";
import type {IssuesResolution, PullRequests} from "~~/types/development/responses.types";

export interface DataSource {
    fetchActiveContributors: (filter: ActiveContributorsFilter) => Promise<ActiveContributorsResponse>;
    fetchActiveOrganizations: (filter: ActiveOrganizationsFilter) => Promise<ActiveOrganizationsResponse>;
    fetchContributorsLeaderboard: (filter: ContributorsLeaderboardFilter) => Promise<ContributorsLeaderboardResponse>;
    fetchOrganizationsLeaderboard: (
        filter: OrganizationsLeaderboardFilter
    ) => Promise<OrganizationsLeaderboardResponse>;
    fetchContributorDependency: (filter: ContributorDependencyFilter) => Promise<ContributorDependencyResponse>;
    fetchOrganizationDependency: (filter: OrganizationDependencyFilter) => Promise<OrganizationDependencyResponse>;
    fetchGeographicDistribution: (filter: GeographicDistributionFilter) => Promise<GeographicDistributionResponse>;
    fetchRetention: (filter: RetentionFilter) => Promise<RetentionResponse>;
    fetchForksActivities: (filter: ActivityCountFilter) => Promise<ForksData>;
    fetchStarsActivities: (filter: ActivityCountFilter) => Promise<StarsData>;
    fetchIssuesResolution: (filter: ActivityCountFilter) => Promise<IssuesResolution>;
    fetchPullRequests: (filter: ActivityCountFilter) => Promise<PullRequests>;
}

export function createDataSource(): DataSource {
    return {
        fetchActiveContributors,
        fetchContributorsLeaderboard,
        fetchActiveOrganizations,
        fetchOrganizationsLeaderboard,
        fetchContributorDependency,
        fetchOrganizationDependency,
        fetchGeographicDistribution,
        fetchRetention,
        fetchForksActivities,
        fetchStarsActivities,
        fetchIssuesResolution,
        fetchPullRequests,
    };
}
