// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Component } from 'vue';
import contributorsLeaderboard from './contributor/contributors-leaderboard/contributors-leaderboard.config';
import organizationsLeaderboard from './contributor/organizations-leaderboard/organizations-leaderboard.config';
import activeContributors from './contributor/active-contributors/active-contributors.config';
import activeOrganizations from './contributor/active-organizations/active-organizations.config';
import contributorDependency from './contributor/contributor-dependency/contributor-dependency.config';
import organizationDependency from './contributor/organization-dependency/organization-dependency.config';
import retention from './contributor/retention/retention.config';
import geographicalDistribution from './contributor/geographical-distribution/geographical-distribution.config';
import stars from './popularity/stars/stars.config';
import forks from './popularity/forks/forks.config';
import githubMentions from './popularity/github-mentions/github-mentions.config';
import socialMentions from './popularity/social-mentions/social-mentions.config';
import pressMentions from './popularity/press-mentions/press-mentions.config';
import searchQueries from './popularity/search-queries/search-queries.config';
import packageDownloads from './popularity/package-downloads/package-downloads.config';
import packageDependency from './popularity/package-dependency/package-dependency.config';
import issuesResolution from './development/issues-resolution/issues-resolution.config';
import pullRequests from './development/pull-requests/pull-requests.config';
import activeDays from './development/active-days/active-days.config';
import contributionsOutsideWorkHours from './development/contributions-outside-work-hours/contributions-outside-work-hours.config';
import mergeLeadTime from './development/merge-lead-time/merge-lead-time.config';
import patchsetsPerReview from './development/patchsets-per-review/patchsets-per-review.config';
import medianTimeToClose from './development/median-time-to-close/median-time-to-close.config';
import medianTimeToReview from './development/median-time-to-review/median-time-to-review.config';
import reviewEfficiency from './development/review-efficiency/review-efficiency.config';
import codeReviewEngagement from './development/code-review-engagement/code-review-engagement.config';
import reviewTimeByPullRequestSize from './development/review-time-by-pull-request-size/review-time-by-pull-request-size.config';
import mailingListMessages from './popularity/mailing-list-messages/mailing-list-messages.config';
import commitActivities from './development/commit-activities/commit-activities.config';
import { Widget } from '~/components/modules/widget/types/widget';
import type { Project } from '~~/types/project';
import { dateOptKeys } from '~/components/modules/project/config/date-options';

export interface WidgetBenchmarkConfig {
  title: string;
  showOnOverview: boolean;
  isVisible: (
    model: WidgetModel,
    selectedTimeRangeKey: dateOptKeys,
    startDate: string,
    endDate: string,
  ) => boolean;
  points: Record<
    number,
    {
      text: string;
      type: 'positive' | 'warning' | 'negative';
      description: string;
    }
  >;
}

export interface WidgetModel {
  includeCollaborations?: boolean;
  [key: string]: number | boolean | string | unknown;
}

export interface WidgetCopilotConfig {
  icon: string;
  suggestions: string;
}

export interface WidgetConfig {
  key: string;
  name: string;
  description: (project: Project, model: object) => string;
  learnMoreLink?: string;
  component: Component;
  share: boolean;
  embed: boolean;
  snapshot: boolean;
  copilot?: WidgetCopilotConfig;
  defaultValue?: WidgetModel | ((project: Project) => WidgetModel);
  additionalShare?: Component;
  hideOnRepoFilter?: boolean;
  benchmark?: WidgetBenchmarkConfig;
  showCollabToggle?: boolean;
  headerFilters?: Component;
  snapshotHeaderComponent?: Component;
}

export const lfxWidgets: Record<Widget, WidgetConfig> = {
  // Contributor
  [Widget.CONTRIBUTORS_LEADERBOARD]: contributorsLeaderboard,
  [Widget.ORGANIZATIONS_LEADERBOARD]: organizationsLeaderboard,
  [Widget.ACTIVE_CONTRIBUTORS]: activeContributors,
  [Widget.ACTIVE_ORGANIZATIONS]: activeOrganizations,
  [Widget.CONTRIBUTOR_DEPENDENCY]: contributorDependency,
  [Widget.ORGANIZATION_DEPENDENCY]: organizationDependency,
  [Widget.RETENTION]: retention,
  [Widget.GEOGRAPHICAL_DISTRIBUTION]: geographicalDistribution,

  // Popularity
  [Widget.STARS]: stars,
  [Widget.FORKS]: forks,
  [Widget.SOCIAL_MENTIONS]: socialMentions,
  [Widget.GITHUB_MENTIONS]: githubMentions,
  [Widget.PRESS_MENTIONS]: pressMentions,
  [Widget.SEARCH_QUERIES]: searchQueries,
  [Widget.PACKAGE_DOWNLOADS]: packageDownloads,
  [Widget.PACKAGE_DEPENDENCY]: packageDependency,
  [Widget.MAILING_LISTS_MESSAGES]: mailingListMessages,

  // Development
  [Widget.ISSUES_RESOLUTION]: issuesResolution,
  [Widget.COMMIT_ACTIVITIES]: commitActivities,
  [Widget.PULL_REQUESTS]: pullRequests,
  [Widget.ACTIVE_DAYS]: activeDays,
  [Widget.CONTRIBUTIONS_OUTSIDE_WORK_HOURS]: contributionsOutsideWorkHours,
  [Widget.MERGE_LEAD_TIME]: mergeLeadTime,
  [Widget.PATCHSETS_PER_REVIEW]: patchsetsPerReview,
  [Widget.MEDIAN_TIME_TO_CLOSE]: medianTimeToClose,
  [Widget.MEDIAN_TIME_TO_REVIEW]: medianTimeToReview,
  [Widget.REVIEW_EFFICIENCY]: reviewEfficiency,
  [Widget.CODE_REVIEW_ENGAGEMENT]: codeReviewEngagement,
  [Widget.REVIEW_TIME_BY_PULL_REQUEST_SIZE]: reviewTimeByPullRequestSize,
};
