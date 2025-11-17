// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import DecimalDataDisplay from '../components/data-displays/decimal.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const resolutionRateConfig: LeaderboardConfig = {
  key: 'resolution-rate',
  name: 'Highest resolution rate',
  description:
    'These projects keep development flowing, with most pull requests merged relative to issues opened.',
  icon: 'rocket-launch',
  dataDisplay: DecimalDataDisplay,
  columnLabel: 'PR/Issue ratio',
  seoTitle: 'Open Source Projects With Best Resolution Rate',
  seoDescription:
    'Leaderboard of open source projects with the most pull requests merged relative to issues opened.',
};
