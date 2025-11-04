// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const longestRunningConfig: LeaderboardConfig = {
  key: 'longest-running',
  name: 'Longest Running',
  description: 'These projects have been actively maintained for the longest period of time.',
  icon: 'clock',
  dataDisplay: NumericDataDisplay,
  sort: 'longestRunning_DESC',
  columnLabel: 'Years Active',
};
