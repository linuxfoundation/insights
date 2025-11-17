// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import IntegerDataDisplay from '../components/data-displays/integer.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const focusedTeamsConfig: LeaderboardConfig = {
  key: 'focused-teams',
  name: 'Most focused teams',
  description: 'These projects show the highest productivity per contributor.',
  icon: 'bullseye-arrow',
  dataDisplay: IntegerDataDisplay,
  columnLabel: 'Avg. commits per author',
  columnTooltip: 'For projects with 10+ authors',
  seoTitle: 'Most Focused Open Source Teams',
  seoDescription:
    'Leaderboard of open source projects with the highest productivity per contributor.',
};
