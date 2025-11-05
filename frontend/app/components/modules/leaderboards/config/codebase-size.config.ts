// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const codebaseSizeConfig: LeaderboardConfig = {
  key: 'codebase-size',
  name: 'Codebase size',
  description:
    'These projects maintain the largest codebases measured by total source lines of code.',
  icon: 'laptop-code',
  dataDisplay: NumericDataDisplay,
  sort: 'codebaseSize_DESC',
  columnLabel: 'Lines of code',
  hideTrend: true,
};
