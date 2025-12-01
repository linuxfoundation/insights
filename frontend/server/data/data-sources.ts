// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
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
  PackageFilter,
  PackageMetricsFilter,
} from '~~/server/data/types';
import type { ActiveContributorsResponse } from '~~/server/data/tinybird/contributors/active-contributors';
import type { ActiveOrganizationsResponse } from '~~/server/data/tinybird/contributors/active-organizations';
import type { OrganizationDependencyResponse } from '~~/server/data/tinybird/contributors/organizations-dependency';
import type { GeographicDistributionResponse } from '~~/server/data/tinybird/contributors/geographic-distribution';
import type { RetentionResponse } from '~~/server/data/tinybird/contributors/retention';
import { fetchActiveContributors } from '~~/server/data/tinybird/contributors/active-contributors';
import { fetchActiveOrganizations } from '~~/server/data/tinybird/contributors/active-organizations';
import { fetchContributorsLeaderboard } from '~~/server/data/tinybird/contributors/contributors-leaderboard';
import { fetchOrganizationsLeaderboard } from '~~/server/data/tinybird/contributors/organizations-leaderboard';
import { fetchContributorDependency } from '~~/server/data/tinybird/contributors/contributors-dependency';
import { fetchOrganizationDependency } from '~~/server/data/tinybird/contributors/organizations-dependency';
import { fetchGeographicDistribution } from '~~/server/data/tinybird/contributors/geographic-distribution';
import { fetchRetention } from '~~/server/data/tinybird/contributors/retention';
import { fetchForksActivities } from '~~/server/data/tinybird/popularity/forks';
import { fetchStarsActivities } from '~~/server/data/tinybird/popularity/stars';
import { fetchIssuesResolution } from '~~/server/data/tinybird/development/issues-resolution';
import { fetchPullRequests } from '~~/server/data/tinybird/development/pull-requests';
import { fetchReviewTimeByPRSize } from '~~/server/data/tinybird/development/review-time-by-pr-size';
import { fetchAverageTimeToMerge } from '~~/server/data/tinybird/development/average-time-to-merge';
import { fetchWaitTimeFor1stReview } from '~~/server/data/tinybird/development/wait-time-for-1st-review';
import { fetchMergeLeadTime } from '~~/server/data/tinybird/development/merge-lead-time';
import { fetchActiveDays } from '~~/server/data/tinybird/development/active-days';
import { fetchCodeReviewEngagement } from '~~/server/data/tinybird/development/code-review-engagement';
import { fetchContributionsOutsideWorkHours } from '~~/server/data/tinybird/development/contributions-outside-work-hours';
import type { ActivityHeatmapByWeekdayTBQuery } from '~~/server/data/tinybird/requests.types';
import type {
  ContributorDependency,
  ContributorLeaderboard,
  OrganizationLeaderboard,
} from '~~/types/contributors/responses.types';
import type {
  ForksData,
  MailingListsMessages,
  StarsData,
  CommitActivities,
  Package,
} from '~~/types/popularity/responses.types';
import type {
  ActiveDays,
  IssuesResolution,
  PullRequests,
  ReviewTimeByPrItem,
  AverageTimeMerge,
  WaitTime1stReview,
  MergeLeadTime,
  CodeReviewEngagement,
  ContributionOutsideHours,
  ActivityTypesByPlatformResponse,
} from '~~/types/development/responses.types';
import type {
  CodeReviewEngagementFilter,
  ActivityTypesFilter,
} from '~~/types/development/requests.types';
import { fetchMailingListsMessageActivities } from '~~/server/data/tinybird/popularity/mailing-lists-messages';
import { fetchCommitActivities } from '~~/server/data/tinybird/development/commit-activites';
import { fetchPackages } from '~~/server/data/tinybird/popularity/packages';
import { fetchPackageMetrics } from '~~/server/data/tinybird/popularity/package-metrics';
import type { PackageDownloadsResponse } from '~~/server/data/tinybird/popularity/package-metrics';
import { fetchActivityTypes } from '~~/server/data/tinybird/activity-types';

export interface DataSource {
  fetchActiveContributors: (
    filter: ActiveContributorsFilter,
  ) => Promise<ActiveContributorsResponse>;
  fetchActiveOrganizations: (
    filter: ActiveOrganizationsFilter,
  ) => Promise<ActiveOrganizationsResponse>;
  fetchContributorsLeaderboard: (
    filter: ContributorsLeaderboardFilter,
  ) => Promise<ContributorLeaderboard>;
  fetchOrganizationsLeaderboard: (
    filter: OrganizationsLeaderboardFilter,
  ) => Promise<OrganizationLeaderboard>;
  fetchContributorDependency: (
    filter: ContributorDependencyFilter,
  ) => Promise<ContributorDependency>;
  fetchOrganizationDependency: (
    filter: OrganizationDependencyFilter,
  ) => Promise<OrganizationDependencyResponse>;
  fetchGeographicDistribution: (
    filter: GeographicDistributionFilter,
  ) => Promise<GeographicDistributionResponse>;
  fetchRetention: (filter: RetentionFilter) => Promise<RetentionResponse>;
  fetchForksActivities: (filter: ActivityCountFilter) => Promise<ForksData>;
  fetchMailingListsMessageActivities: (
    filter: ActivityCountFilter,
  ) => Promise<MailingListsMessages>;
  fetchStarsActivities: (filter: ActivityCountFilter) => Promise<StarsData>;
  fetchIssuesResolution: (filter: ActivityCountFilter) => Promise<IssuesResolution>;
  fetchCommitActivities: (filter: ActivityCountFilter) => Promise<CommitActivities>;
  fetchPullRequests: (filter: ActivityCountFilter) => Promise<PullRequests>;
  fetchReviewTimeByPRSize: (filter: ReviewTimeByPRSizeFilter) => Promise<ReviewTimeByPrItem[]>;
  fetchAverageTimeToMerge: (filter: AverageTimeToMergeFilter) => Promise<AverageTimeMerge>;
  fetchWaitTimeFor1stReview: (filter: WaitTimeFor1stReviewFilter) => Promise<WaitTime1stReview>;
  fetchMergeLeadTime: (filter: MergeLeadTimeFilter) => Promise<MergeLeadTime>;
  fetchActiveDays: (filter: ActiveDaysFilter) => Promise<ActiveDays>;
  fetchCodeReviewEngagement: (filter: CodeReviewEngagementFilter) => Promise<CodeReviewEngagement>;
  fetchContributionsOutsideWorkHours: (
    filter: ActivityHeatmapByWeekdayTBQuery,
  ) => Promise<ContributionOutsideHours>;
  fetchPackages(filter: PackageFilter): Promise<Package[]>;
  fetchPackageMetrics(filter: PackageMetricsFilter): Promise<PackageDownloadsResponse>;
  fetchActivityTypes(filter: ActivityTypesFilter): Promise<ActivityTypesByPlatformResponse>;
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
    fetchMailingListsMessageActivities,
    fetchStarsActivities,
    fetchIssuesResolution,
    fetchCommitActivities,
    fetchPullRequests,
    fetchAverageTimeToMerge,
    fetchWaitTimeFor1stReview,
    fetchMergeLeadTime,
    fetchActiveDays,
    fetchReviewTimeByPRSize,
    fetchCodeReviewEngagement,
    fetchContributionsOutsideWorkHours,
    fetchPackages,
    fetchPackageMetrics,
    fetchActivityTypes,
  };
}
