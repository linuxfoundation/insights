// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export enum TanstackKey {
  COLLECTIONS = 'collections',
  COLLECTION = 'collection',
  CATEGORY_GROUPS = 'category-groups',
  PROJECTS = 'projects',
  PROJECT = 'project',

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
  PULL_REQUESTS = 'pull-requests',
  REVIEW_TIME_BY_PULL_REQUEST_SIZE = 'review-time-by-pull-request-size',
  WAIT_TIME_FIRST_REVIEW = 'wait-time-first-review',
  COMMIT_ACTIVITIES = 'commit-activities',

  // Popularity
  FORKS = 'forks',
  FORKS_CUMULATIVE = 'forks-cumulative',
  GITHUB_MENTIONS = 'github-mentions',
  PACKAGE_DOWNLOADS = 'package-downloads',
  PACKAGES = 'packages',
  PRESS_MENTIONS = 'press-mentions',
  SEARCH_QUERIES = 'search-queries',
  SOCIAL_MENTIONS = 'social-mentions',
  STARS = 'stars',
  STARS_CUMULATIVE = 'stars-cumulative',
  MAILING_LISTS_MESSAGES = 'mailing-lists-messages',
  // Overview
  HEALTH_SCORE = 'health-score',
  HEALTH_SCORE_OVERVIEW = 'health-score-overview',
  TRUST_SCORE_SUMMARY = 'trust-score-summary',
  SCORE_DATA = 'score-data',
  ASSOCIATED_ORGANIZATION = 'associated-organization',

  // Security
  SECURITY_ASSESSMENT = 'security-assessment',

  // Open Source Index
  OSS_INDEX_GROUP = 'oss-index-group',
  OSS_INDEX_CATEGORY = 'oss-index-category',
  OSS_INDEX_COLLECTION = 'oss-index-collection',
  OSS_INDEX_PROJECTS = 'oss-index-projects',
  OSS_INDEX_COLLECTIONS_LIST = 'oss-index-collections-list',

  // Explore
  TOP_CONTRIBUTORS = 'explore-top-contributors',
  TOP_ORGANIZATIONS = 'explore-top-organizations',
  TOP_PROJECTS = 'explore-top-projects',
}
