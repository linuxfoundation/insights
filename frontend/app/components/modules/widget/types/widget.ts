// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export enum Widget {
  // Contributors
  ACTIVE_CONTRIBUTORS = 'active-contributors',
  ACTIVE_ORGANIZATIONS = 'active-organizations',
  CONTRIBUTOR_DEPENDENCY = 'contributor-dependency',
  CONTRIBUTORS_LEADERBOARD = 'contributors-leaderboard',
  GEOGRAPHICAL_DISTRIBUTION = 'geographical-distribution',
  ORGANIZATION_DEPENDENCY = 'organization-dependency',
  ORGANIZATIONS_LEADERBOARD = 'organizations-leaderboard',
  RETENTION = 'retention',

  // Development
  ACTIVE_DAYS = 'active-days',
  AVERAGE_TIME_TO_MERGE = 'average-time-to-merge',
  CODE_REVIEW_ENGAGEMENT = 'code-review-engagement',
  CONTRIBUTIONS_OUTSIDE_WORK_HOURS = 'contributions-outside-work-hours',
  ISSUES_RESOLUTION = 'issues-resolution',
  MERGE_LEAD_TIME = 'merge-lead-time',
  PATCHSETS_PER_REVIEW = 'patchsets-per-review',
  PULL_REQUESTS = 'pull-requests',
  REVIEW_TIME_BY_PULL_REQUEST_SIZE = 'review-time-by-pull-request-size',
  WAIT_TIME_FIRST_REVIEW = 'wait-time-first-review',
  COMMIT_ACTIVITIES = 'commit-activities',

  // Popularity
  FORKS = 'forks',
  GITHUB_MENTIONS = 'github-mentions',
  PACKAGE_DOWNLOADS = 'package-downloads',
  PACKAGE_DEPENDENCY = 'package-dependency',
  PRESS_MENTIONS = 'press-mentions',
  SEARCH_QUERIES = 'search-queries',
  SOCIAL_MENTIONS = 'social-mentions',
  STARS = 'stars',
  MAILING_LISTS_MESSAGES = 'mailing-lists-messages',
}
