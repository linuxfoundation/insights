// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const mostActiveContributorsConfig: LeaderboardConfig = {
  key: 'active-contributors',
  name: 'Most Active Contributors',
  description: 'These projects had the most unique contributors over the past 12 months.',
  icon: 'people-group',
  dataDisplay: NumericDataDisplay,
  sort: 'mostActiveContributors_DESC',
  columnLabel: 'Contributors (12M)',
};
