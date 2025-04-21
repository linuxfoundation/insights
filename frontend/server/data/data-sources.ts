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
  ActiveDaysFilter,
  WaitTimeFor1stReviewFilter,
  AverageTimeToMergeFilter,
  MergeLeadTimeFilter,
  ReviewTimeByPRSizeFilter,
} from "~~/server/data/types";
import type {ActiveContributorsResponse} from "~~/server/data/tinybird/active-contributors-data-source";
import type {ActiveOrganizationsResponse} from "~~/server/data/tinybird/active-organizations-data-source";
import type {OrganizationDependencyResponse} from "~~/server/data/tinybird/organizations-dependency-data-source";
import type {GeographicDistributionResponse} from "~~/server/data/tinybird/geographic-distribution-data-source";
import type {RetentionResponse} from "~~/server/data/tinybird/retention-data-source";
import {fetchActiveContributors} from "~~/server/data/tinybird/active-contributors-data-source";
import {fetchActiveOrganizations} from "~~/server/data/tinybird/active-organizations-data-source";
import {fetchContributorsLeaderboard} from "~~/server/data/tinybird/contributors-leaderboard-data-source";
import {fetchOrganizationsLeaderboard} from "~~/server/data/tinybird/organizations-leaderboard-data-source";
import {fetchContributorDependency} from "~~/server/data/tinybird/contributors-dependency-data-source";
import {fetchOrganizationDependency} from "~~/server/data/tinybird/organizations-dependency-data-source";
import {fetchGeographicDistribution} from "~~/server/data/tinybird/geographic-distribution-data-source";
import {fetchRetention} from "~~/server/data/tinybird/retention-data-source";
import {fetchForksActivities} from "~~/server/data/tinybird/forks-data-source";
import {fetchStarsActivities} from "~~/server/data/tinybird/stars-data-source";
import {fetchIssuesResolution} from "~~/server/data/tinybird/issues-resolution-data-source";
import {fetchPullRequests} from "~~/server/data/tinybird/pull-requests-data-source";
import {fetchReviewTimeByPRSize} from "~~/server/data/tinybird/review-time-by-pr-size-data-source";
import {fetchAverageTimeToMerge} from "~~/server/data/tinybird/average-time-to-merge-data-source";
import {fetchWaitTimeFor1stReview} from "~~/server/data/tinybird/wait-time-for-1st-review-data-source";
import {fetchMergeLeadTime} from "~~/server/data/tinybird/merge-lead-time-data-source";
import {fetchActiveDays} from "~~/server/data/tinybird/active-days-data-source";
import {fetchCodeReviewEngagement} from "~~/server/data/tinybird/code-review-engagement-data-source";
import {
  fetchContributionsOutsideWorkHours
} from "~~/server/data/tinybird/contributions-outside-work-hours-data-source";
import type {ActivityHeatmapByWeekdayTBQuery} from "~~/server/data/tinybird/requests.types";
import type {
  ContributorDependency,
  ContributorLeaderboard,
  OrganizationLeaderboard
} from "~~/types/contributors/responses.types";
import type {ForksData, StarsData} from "~~/types/popularity/responses.types";
import type {
  ActiveDays,
  IssuesResolution,
  PullRequests,
  ReviewTimeByPrItem,
  AverageTimeMerge,
  WaitTime1stReview,
  MergeLeadTime,
  CodeReviewEngagement,
  ContributionOutsideHours
} from "~~/types/development/responses.types";
import type {CodeReviewEngagementFilter} from "~~/types/development/requests.types";

export interface DataSource {
    fetchActiveContributors: (filter: ActiveContributorsFilter) => Promise<ActiveContributorsResponse>;
    fetchActiveOrganizations: (filter: ActiveOrganizationsFilter) => Promise<ActiveOrganizationsResponse>;
    fetchContributorsLeaderboard: (filter: ContributorsLeaderboardFilter) => Promise<ContributorLeaderboard>;
    fetchOrganizationsLeaderboard: (
        filter: OrganizationsLeaderboardFilter
    ) => Promise<OrganizationLeaderboard>;
    fetchContributorDependency: (filter: ContributorDependencyFilter) => Promise<ContributorDependency>;
    fetchOrganizationDependency: (filter: OrganizationDependencyFilter) => Promise<OrganizationDependencyResponse>;
    fetchGeographicDistribution: (filter: GeographicDistributionFilter) => Promise<GeographicDistributionResponse>;
    fetchRetention: (filter: RetentionFilter) => Promise<RetentionResponse>;
    fetchForksActivities: (filter: ActivityCountFilter) => Promise<ForksData>;
    fetchStarsActivities: (filter: ActivityCountFilter) => Promise<StarsData>;
    fetchIssuesResolution: (filter: ActivityCountFilter) => Promise<IssuesResolution>;
    fetchPullRequests: (filter: ActivityCountFilter) => Promise<PullRequests>;
    fetchReviewTimeByPRSize: (filter: ReviewTimeByPRSizeFilter) => Promise<ReviewTimeByPrItem[]>;
    fetchAverageTimeToMerge: (filter: AverageTimeToMergeFilter) => Promise<AverageTimeMerge>;
    fetchWaitTimeFor1stReview: (filter: WaitTimeFor1stReviewFilter) => Promise<WaitTime1stReview>;
    fetchMergeLeadTime: (filter: MergeLeadTimeFilter) => Promise<MergeLeadTime>;
    fetchActiveDays: (filter: ActiveDaysFilter) => Promise<ActiveDays>;
    fetchCodeReviewEngagement: (filter: CodeReviewEngagementFilter) => Promise<CodeReviewEngagement>;
    fetchContributionsOutsideWorkHours: (filter: ActivityHeatmapByWeekdayTBQuery)
      => Promise<ContributionOutsideHours>;
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
        fetchAverageTimeToMerge,
        fetchWaitTimeFor1stReview,
        fetchMergeLeadTime,
        fetchActiveDays,
        fetchReviewTimeByPRSize,
        fetchCodeReviewEngagement,
        fetchContributionsOutsideWorkHours,
    };
}
