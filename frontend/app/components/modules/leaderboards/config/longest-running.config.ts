// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxProjectTimestampRowDisplay from '../components/row-displays/project-timestamp.vue';
import LfxProjectTimestampMinimizedRowDisplay from '../components/minimize-row-displays/project-timestamp.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const longestRunningConfig: LeaderboardConfig = {
  key: 'longest-running',
  name: 'Longest running',
  description: 'These projects have been maintained the longest.',
  icon: 'calendar-range',
  dataDisplay: LfxProjectTimestampRowDisplay,
  minimizedDataDisplay: LfxProjectTimestampMinimizedRowDisplay,
  entityLabel: 'Project',
  metricLabel: 'Time since first commit',
};
