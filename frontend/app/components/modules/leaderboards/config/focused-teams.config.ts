// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const focusedTeamsConfig: LeaderboardConfig = {
  key: 'focused-teams',
  name: 'Focused Teams',
  description:
    'These projects have the highest ratio of commits to contributors, indicating focused development efforts.',
  icon: 'bullseye',
  dataDisplay: NumericDataDisplay,
  sort: 'focusedTeams_DESC',
  columnLabel: 'Commits per Contributor',
};
