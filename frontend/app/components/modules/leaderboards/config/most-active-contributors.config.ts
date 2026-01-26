// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxProjectIntegerRowDisplay from '../components/row-displays/project-integer.vue';
import LfxProjectIntegerMinimizedRowDisplay from '../components/minimize-row-displays/project-integer.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const mostActiveContributorsConfig: LeaderboardConfig = {
  key: 'active-contributors',
  name: 'Most active contributors',
  description:
    'These projects attracted the highest number of unique contributors over the past 12 months.',
  icon: 'people-group',
  dataDisplay: LfxProjectIntegerRowDisplay,
  minimizedDataDisplay: LfxProjectIntegerMinimizedRowDisplay,
  entityLabel: 'Project',
  metricLabel: 'Contributors (12M)',
};
