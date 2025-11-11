// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const top100ProjectsConfig: LeaderboardConfig = {
  key: 'projects',
  name: 'Top 100 projects',
  description: 'Open source projects ranked by the total number of contributors.',
  icon: 'trophy',
  dataDisplay: NumericDataDisplay,
  columnLabel: 'Contributors',
  dataType: 'integer',
  // TODO: Add seo title from Jonathan, these are not in the document he shared
  seoTitle: 'Open Source Projects With Top 100 Contributors',
  seoDescription:
    'Leaderboard of open source projects with the most active and influential individuals.',
};
