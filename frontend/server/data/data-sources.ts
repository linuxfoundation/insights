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
  MergeLeadTimeFilter,
  ReviewTimeByPRSizeFilter,
  PackageFilter,
  PackageMetricsFilter,
  PatchSetsFilter,
  MedianTimeToCloseFilter,
  MedianTimeToReviewFilter,
  ReviewEfficiencyFilter,
} from '~~/server/data/types';
import type { ActiveContributorsResponse } from '~~/server/data/tinybird/active-contributors-data-source';
import type { ActiveOrganizationsResponse } from '~~/server/data/tinybird/active-organizations-data-source';
import type { OrganizationDependencyResponse } from '~~/server/data/tinybird/organizations-dependency-data-source';
import type { GeographicDistributionResponse } from '~~/server/data/tinybird/geographic-distribution-data-source';
import type { RetentionResponse } from '~~/server/data/tinybird/retention-data-source';
import { fetchActiveContributors } from '~~/server/data/tinybird/active-contributors-data-source';
import { fetchActiveOrganizations } from '~~/server/data/tinybird/active-organizations-data-source';
import { fetchContributorsLeaderboard } from '~~/server/data/tinybird/contributors-leaderboard-data-source';
import { fetchOrganizationsLeaderboard } from '~~/server/data/tinybird/organizations-leaderboard-data-source';
import { fetchContributorDependency } from '~~/server/data/tinybird/contributors-dependency-data-source';
import { fetchOrganizationDependency } from '~~/server/data/tinybird/organizations-dependency-data-source';
import { fetchGeographicDistribution } from '~~/server/data/tinybird/geographic-distribution-data-source';
import { fetchRetention } from '~~/server/data/tinybird/retention-data-source';
import { fetchForksActivities } from '~~/server/data/tinybird/forks-data-source';
import { fetchStarsActivities } from '~~/server/data/tinybird/stars-data-source';
import { fetchIssuesResolution } from '~~/server/data/tinybird/issues-resolution-data-source';
import { fetchPullRequests } from '~~/server/data/tinybird/pull-requests-data-source';
import { fetchReviewTimeByPRSize } from '~~/server/data/tinybird/review-time-by-pr-size-data-source';
import { fetchMedianTimeToClose } from '~~/server/data/tinybird/median-time-to-close-data-source';
import { fetchMedianTimeToReview } from '~~/server/data/tinybird/median-time-to-review-data-source';
import { fetchPatchsetsPerReview } from '~~/server/data/tinybird/patchsets-per-review-data-source';
import { fetchReviewEfficiency } from '~~/server/data/tinybird/review-efficiency-data-source';
import { fetchMergeLeadTime } from '~~/server/data/tinybird/merge-lead-time-data-source';
import { fetchActiveDays } from '~~/server/data/tinybird/active-days-data-source';
import { fetchCodeReviewEngagement } from '~~/server/data/tinybird/code-review-engagement-data-source';
import { fetchContributionsOutsideWorkHours } from '~~/server/data/tinybird/contributions-outside-work-hours-data-source';
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
  MedianTimeToClose,
  MedianTimeToReview,
  PatchsetsPerReview,
  PullRequests,
  ReviewEfficiency,
  ReviewTimeByPrItem,
  MergeLeadTime,
  CodeReviewEngagement,
  ContributionOutsideHours,
  ActivityTypesByPlatformResponse,
} from '~~/types/development/responses.types';
import type {
  CodeReviewEngagementFilter,
  ActivityTypesFilter,
} from '~~/types/development/requests.types';
import { fetchMailingListsMessageActivities } from '~~/server/data/tinybird/mailing-lists-messages-data-source';
import { fetchCommitActivities } from '~~/server/data/tinybird/commit-activites-data-source';
import { fetchPackages } from '~~/server/data/tinybird/packages-data-source';
import { fetchPackageMetrics } from '~~/server/data/tinybird/package-metrics-data-source';
import type { PackageDownloadsResponse } from '~~/server/data/tinybird/package-metrics-data-source';
import { fetchActivityTypes } from '~~/server/data/tinybird/activity-types-data-source';

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
  fetchMedianTimeToClose: (filter: MedianTimeToCloseFilter) => Promise<MedianTimeToClose>;
  fetchMedianTimeToReview: (filter: MedianTimeToReviewFilter) => Promise<MedianTimeToReview>;
  fetchPatchsetsPerReview: (filter: PatchSetsFilter) => Promise<PatchsetsPerReview>;
  fetchReviewEfficiency: (filter: ReviewEfficiencyFilter) => Promise<ReviewEfficiency>;
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
    fetchMedianTimeToClose,
    fetchMedianTimeToReview,
    fetchPatchsetsPerReview,
    fetchReviewEfficiency,
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
