// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const top100ContributorsConfig: LeaderboardConfig = {
  key: 'top-100-contributors',
  name: 'Top 100 contributors',
  description:
    'Developers ranked by volume of contributions over the last 10 years, highlighting the most active and influential individuals.',
  icon: 'head-side-gear',
  dataDisplay: NumericDataDisplay,
  columnLabel: 'Contributions (10y)',
  dataType: 'integer',
  // TODO: Add seo title from Jonathan, these are not in the document he shared
  seoTitle: 'Open Source Projects With Top 100 Contributors',
  seoDescription:
    'Leaderboard of open source projects with the most active and influential individuals.',
};
