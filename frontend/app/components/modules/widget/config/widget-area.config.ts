// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Widget } from '~/components/modules/widget/types/widget';
import { WidgetArea } from '~/components/modules/widget/types/widget-area';

export interface WidgetAreaConfig {
  label: string;
  widgets?: Widget[];
}

export const lfxWidgetArea: Record<WidgetArea, WidgetAreaConfig> = {
  [WidgetArea.OVERVIEW]: {
    label: 'Overview',
  },
  [WidgetArea.CONTRIBUTORS]: {
    label: 'Contributors',
    widgets: [
      Widget.CONTRIBUTORS_LEADERBOARD,
      Widget.ORGANIZATIONS_LEADERBOARD,
      Widget.ACTIVE_CONTRIBUTORS,
      Widget.ACTIVE_ORGANIZATIONS,
      Widget.CONTRIBUTOR_DEPENDENCY,
      Widget.ORGANIZATION_DEPENDENCY,
      Widget.RETENTION,
      Widget.GEOGRAPHICAL_DISTRIBUTION,
    ],
  },
  [WidgetArea.POPULARITY]: {
    label: 'Popularity',
    widgets: [
      Widget.STARS,
      Widget.FORKS,
      Widget.SOCIAL_MENTIONS,
      Widget.GITHUB_MENTIONS,
      Widget.PRESS_MENTIONS,
      Widget.SEARCH_QUERIES,
      Widget.PACKAGE_DOWNLOADS,
      Widget.PACKAGE_DEPENDENCY,
      Widget.MAILING_LISTS_MESSAGES,
    ],
  },
  [WidgetArea.DEVELOPMENT]: {
    label: 'Development',
    widgets: [
      Widget.ISSUES_RESOLUTION,
      Widget.COMMIT_ACTIVITIES,
      Widget.PULL_REQUESTS,
      Widget.ACTIVE_DAYS,
      Widget.CONTRIBUTIONS_OUTSIDE_WORK_HOURS,
      Widget.MERGE_LEAD_TIME,
      Widget.REVIEW_TIME_BY_PULL_REQUEST_SIZE,
      Widget.CODE_REVIEW_ENGAGEMENT,
      Widget.PATCHSETS_PER_REVIEW,
      Widget.MEDIAN_TIME_TO_CLOSE,
      Widget.MEDIAN_TIME_TO_REVIEW,
      Widget.REVIEW_EFFICIENCY,
    ],
  },
  [WidgetArea.SECURITY]: {
    label: 'Security & Best practices',
  },
  [WidgetArea.COMMUNITY]: {
    label: 'Community Voice',
  },
  [WidgetArea.OTHER]: {
    label: 'Other',
  },
};
