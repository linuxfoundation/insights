// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LongestRunningDataDisplay from '../components/data-displays/longest-running.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const longestRunningConfig: LeaderboardConfig = {
  key: 'longest-running',
  name: 'Longest running',
  description: 'These projects have been maintained the longest.',
  icon: 'calendar-range',
  dataDisplay: LongestRunningDataDisplay,
  columnLabel: 'Time since first commit',
  columnTooltip: 'For projects with at least 1 commit in the last 12 months',
  seoTitle: 'Longest-Running Open Source Projects',
  seoDescription: 'Leaderboard of open source projects that have been maintained the longest.',
};
