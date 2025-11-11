// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const top100OrganizationsConfig: LeaderboardConfig = {
  key: 'organizations',
  name: 'Top 100 organizations',
  description:
    'Most influential organizations based on the total number of contributions made over the last 10 years.',
  icon: 'building-flag',
  dataDisplay: NumericDataDisplay,
  columnLabel: 'Contributions (10Y)',
  dataType: 'integer',
  // TODO: Add seo title from Jonathan, these are not in the document he shared
  seoTitle: 'Open Source Projects With Top 100 Organizations',
  seoDescription: 'Leaderboard of open source projects with the most influential organizations.',
};
