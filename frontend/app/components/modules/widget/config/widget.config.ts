// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {Component} from "vue";
import contributorsLeaderboard from "./contributor/contributors-leaderboard/contributors-leaderboard.config";
import organizationsLeaderboard
    from "./contributor/organizations-leaderboard/organizations-leaderboard.config";
import activeContributors
    from "./contributor/active-contributors/active-contributors.config";
import activeOrganizations
    from "./contributor/active-organizations/active-organizations.config";
import contributorDependency
    from "./contributor/contributor-dependency/contributor-dependency.config";
import organizationDependency
    from "./contributor/organization-dependency/organization-dependency.config";
import retention from "./contributor/retention/retention.config";
import geographicalDistribution
    from "./contributor/geographical-distribution/geographical-distribution.config";
import stars from "./popularity/stars/stars.config";
import forks from "./popularity/forks/forks.config";
import githubMentions from "./popularity/github-mentions/github-mentions.config";
import socialMentions from "./popularity/social-mentions/social-mentions.config";
import pressMentions from "./popularity/press-mentions/press-mentions.config";
import searchQueries from "./popularity/search-queries/search-queries.config";
import packageDownloads from "./popularity/package-downloads/package-downloads.config";
import issuesResolution
    from "./development/issues-resolution/issues-resolution.config";
import pullRequests from "./development/pull-requests/pull-requests.config";
import activeDays from "./development/active-days/active-days.config";
import contributionsOutsideWorkHours
    from "./development/contributions-outside-work-hours/contributions-outside-work-hours.config";
import mergeLeadTime from "./development/merge-lead-time/merge-lead-time.config";
import averateTimeToMerge
    from "./development/average-time-to-merge/average-time-to-merge.config";
import waitTimeFirstReview
    from "./development/wait-time-first-review/wait-time-first-review.config";
import codeReviewEngagement
    from "./development/code-review-engagement/code-review-engagement.config";
import reviewTimeByPullRequestSize
    from "./development/review-time-by-pull-request-size/review-time-by-pull-request-size.config";
import mailingListMessages
    from "./popularity/mailing-list-messages/mailing-list-messages.config";
import commitActivities from "./development/commit-activities/commit-activities.config";
import {Widget} from "~/components/modules/widget/types/widget";
import type {Project} from "~~/types/project";

export interface WidgetConfig {
  key: string;
  name: string;
  description: (project: Project) => string;
  learnMoreLink?: string;
  component: Component;
  share: boolean;
  embed: boolean;
  snapshot: boolean;
  defaultValue?: Record<string, unknown>;
  additionalShare?: Component;
  hideOnRepoFilter?: boolean;
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
  [Widget.MAILING_LISTS_MESSAGES]: mailingListMessages,

  // Development
  [Widget.ISSUES_RESOLUTION]: issuesResolution,
  [Widget.COMMIT_ACTIVITIES]: commitActivities,
  [Widget.PULL_REQUESTS]: pullRequests,
  [Widget.ACTIVE_DAYS]: activeDays,
  [Widget.CONTRIBUTIONS_OUTSIDE_WORK_HOURS]: contributionsOutsideWorkHours,
  [Widget.MERGE_LEAD_TIME]: mergeLeadTime,
  [Widget.AVERAGE_TIME_TO_MERGE]: averateTimeToMerge,
  [Widget.WAIT_TIME_FIRST_REVIEW]: waitTimeFirstReview,
  [Widget.CODE_REVIEW_ENGAGEMENT]: codeReviewEngagement,
  [Widget.REVIEW_TIME_BY_PULL_REQUEST_SIZE]: reviewTimeByPullRequestSize
};
