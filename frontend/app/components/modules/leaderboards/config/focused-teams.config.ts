// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxProjectIntegerRowDisplay from '../components/row-displays/project-integer.vue';
import LfxProjectIntegerMinimizedRowDisplay from '../components/minimize-row-displays/project-integer.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const focusedTeamsConfig: LeaderboardConfig = {
  key: 'focused-teams',
  name: 'Most focused teams',
  description: 'These projects show the highest productivity per contributor.',
  icon: 'bullseye-arrow',
  dataDisplay: LfxProjectIntegerRowDisplay,
  minimizedDataDisplay: LfxProjectIntegerMinimizedRowDisplay,
  entityLabel: 'Project',
  metricLabel: 'Avg. commits per author',
  metricTooltip: 'For projects with 10+ authors',
};
