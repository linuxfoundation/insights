// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const top100ProjectsConfig: LeaderboardConfig = {
  key: 'top-100-projects',
  name: 'Top 100 projects',
  description: 'Open source projects ranked by the total number of contributors.',
  icon: 'trophy',
  dataDisplay: NumericDataDisplay,
  columnLabel: 'Contributors',
  dataType: 'integer',
};
