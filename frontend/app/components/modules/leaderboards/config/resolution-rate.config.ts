// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const resolutionRateConfig: LeaderboardConfig = {
  key: 'resolution-rate',
  name: 'Highest resolution rate',
  description:
    'These projects keep development flowing, with most pull requests merged relative to issues opened.',
  icon: 'rocket-launch',
  dataDisplay: NumericDataDisplay,
  sort: 'resolutionRate_DESC',
  columnLabel: 'PR/Issue ratio',
};
