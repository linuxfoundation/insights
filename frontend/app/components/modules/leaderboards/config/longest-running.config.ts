// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import TimeDurationDisplay from '../components/data-displays/time-duration.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const longestRunningConfig: LeaderboardConfig = {
  key: 'longest-running',
  name: 'Longest running',
  description: 'These projects have been maintained the longest.',
  icon: 'calendar-range',
  dataDisplay: TimeDurationDisplay,
  columnLabel: 'Time since first commit',
  columnTooltip: 'For projects with at least 1 commit in the last 12 months',
  hideTrend: true,
  dataType: 'timestamp',
  seoTitle: 'Longest-Running Open Source Projects',
  seoDescription: 'Leaderboard of open source projects that have been maintained the longest.',
};
