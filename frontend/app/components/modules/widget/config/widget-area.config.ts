// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Widget } from '~/components/modules/widget/types/widget';
import { WidgetArea } from '~/components/modules/widget/types/widget-area';

export interface WidgetAreaConfig {
  label: string;
  widgets?: Widget[];
  overviewWidgets?: Widget[];
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
    overviewWidgets: [
      Widget.RETENTION,
      Widget.ACTIVE_CONTRIBUTORS,
      Widget.CONTRIBUTOR_DEPENDENCY,
      Widget.ORGANIZATION_DEPENDENCY,
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
      // TODO: Uncomment this when the search queries widget is ready
      // Widget.SEARCH_QUERIES,
      Widget.PACKAGE_DOWNLOADS,
      Widget.PACKAGE_DEPENDENCY,
      Widget.MAILING_LISTS_MESSAGES,
    ],
    overviewWidgets: [Widget.STARS, Widget.FORKS],
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
      Widget.AVERAGE_TIME_TO_MERGE,
      Widget.WAIT_TIME_FIRST_REVIEW,
      Widget.CODE_REVIEW_ENGAGEMENT,
    ],
    overviewWidgets: [
      Widget.ACTIVE_DAYS,
      Widget.CONTRIBUTIONS_OUTSIDE_WORK_HOURS,
      Widget.ISSUES_RESOLUTION,
      Widget.MERGE_LEAD_TIME,
      Widget.PULL_REQUESTS,
    ],
  },
  [WidgetArea.SECURITY]: {
    label: 'Security & Best practices',
  },
  [WidgetArea.OTHER]: {
    label: 'Other',
  },
};
