// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const mostActiveContributorsConfig: LeaderboardConfig = {
  key: 'most-active-contributors',
  name: 'Most Active Contributors',
  icon: 'business-line',
  dataDisplay: NumericDataDisplay,
  sort: 'mostActiveContributors_DESC',
  columnLabel: 'Contributors (12M)',
};
