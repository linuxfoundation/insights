// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const smallTeamsMassiveOutputConfig: LeaderboardConfig = {
  key: 'small-teams-massive-output',
  name: 'Small Teams, Massive Output',
  description:
    'These projects achieve high productivity with small teams, demonstrating exceptional efficiency.',
  icon: 'users',
  dataDisplay: NumericDataDisplay,
  sort: 'smallTeamsMassiveOutput_DESC',
  columnLabel: 'Productivity Score',
};
