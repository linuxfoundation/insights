// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export enum TanstackKey {
  COLLECTIONS = 'collections',
  COLLECTION = 'collection',
  COLLECTION_DISCOVERY = 'collection-discovery',
  MY_COLLECTIONS = 'my-collections',
  LIKED_COLLECTIONS = 'liked-collections',
  LIKE_COUNTS = 'like-counts',
  COLLECTION_PROJECTS = 'collection-projects',
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
  ACTIVITY_TYPES = 'activity-types',
  CODE_REVIEW_ENGAGEMENT = 'code-review-engagement',
  CONTRIBUTIONS_OUTSIDE_WORK_HOURS = 'contributions-outside-work-hours',
  ISSUES_RESOLUTION = 'issues-resolution',
  MEDIAN_TIME_TO_CLOSE = 'median-time-to-close',
  MEDIAN_TIME_TO_REVIEW = 'median-time-to-review',
  MERGE_LEAD_TIME = 'merge-lead-time',
  PATCHSETS_PER_REVIEW = 'patchsets-per-review',
  PULL_REQUESTS = 'pull-requests',
  REVIEW_EFFICIENCY = 'review-efficiency',
  REVIEW_TIME_BY_PULL_REQUEST_SIZE = 'review-time-by-pull-request-size',
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
  VULNERABILITIES = 'vulnerabilities',

  // Community
  COMMUNITY_MENTIONS = 'community-mentions',

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

  // Leaderboards
  LEADERBOARD_INDEX = 'leaderboard-index',
  LEADERBOARD_DETAIL = 'leaderboard-detail',
  LEADERBOARD_DETAIL_SEARCH = 'leaderboard-detail-search',

  // Badges
  PROJECT_BADGES = 'project-badges',

  // Reports
  CNCF_GEO_TIMESERIES = 'cncf-geo-timeseries',
  CNCF_GEO_DISTRIBUTION = 'cncf-geo-distribution',

  // AI Code Tracker
  AI_CODE_TRACKER = 'ai-code-tracker',

  // Agentic AI Momentum
  AGENTIC_AI_PROJECTS = 'agentic-ai-projects',
  AGENTIC_AI_STARGAZERS = 'agentic-ai-stargazers',
  AGENTIC_AI_FORKS = 'agentic-ai-forks',
  AGENTIC_AI_CONTRIBUTORS = 'agentic-ai-contributors',
  AGENTIC_AI_NEW_CONTRIBUTORS = 'agentic-ai-new-contributors',
  AGENTIC_AI_PR_MERGE_RATE = 'agentic-ai-pr-merge-rate',
  AGENTIC_AI_DOWNLOADS = 'agentic-ai-downloads',
  AGENTIC_AI_RESEARCH_PAPERS = 'agentic-ai-research-papers',
  AGENTIC_AI_GITHUB_BREADTH = 'agentic-ai-github-breadth',
  AGENTIC_AI_COMMITS = 'agentic-ai-commits',
  AGENTIC_AI_TIME_TO_CLOSE = 'agentic-ai-time-to-close',
  AGENTIC_AI_COCOMO = 'agentic-ai-cocomo',
  AGENTIC_AI_DOCKER_PULLS = 'agentic-ai-docker-pulls',
  AGENTIC_AI_DEPENDENT_REPOS = 'agentic-ai-dependent-repos',
  AGENTIC_AI_DEPENDENT_PACKAGES = 'agentic-ai-dependent-packages',
  AGENTIC_AI_DOCKER_DEPENDENTS = 'agentic-ai-docker-dependents',
  AGENTIC_AI_GITHUB_RELEASES = 'agentic-ai-github-releases',
  AGENTIC_AI_OPEN_ISSUES = 'agentic-ai-open-issues',
  AGENTIC_AI_CLOSED_ISSUES = 'agentic-ai-closed-issues',
  AGENTIC_AI_TIME_TO_FIRST_RESPONSE = 'agentic-ai-time-to-first-response',
  AGENTIC_AI_NO_RESPONSE_SHARE = 'agentic-ai-no-response-share',
  AGENTIC_AI_PR_TIME_TO_RESOLVE = 'agentic-ai-pr-time-to-resolve',
  AGENTIC_AI_TOTAL_VULNERABILITIES = 'agentic-ai-total-vulnerabilities',
  AGENTIC_AI_FIXED_VULNERABILITIES = 'agentic-ai-fixed-vulnerabilities',
}
