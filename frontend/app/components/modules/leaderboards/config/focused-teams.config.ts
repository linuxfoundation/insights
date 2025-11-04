// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const focusedTeamsConfig: LeaderboardConfig = {
  key: 'focused-teams',
  name: 'Most focused teams',
  description: 'These projects show the highest productivity per contributor.',
  icon: 'bullseye-arrow',
  dataDisplay: NumericDataDisplay,
  sort: 'focusedTeams_DESC',
  columnLabel: 'Avg. commits per author',
  columnTooltip: 'For projects with 10+ authors',
};
