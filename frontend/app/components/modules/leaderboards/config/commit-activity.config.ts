// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const commitActivityConfig: LeaderboardConfig = {
  key: 'commit-activity',
  name: 'Commit Activity',
  description: 'These projects had the most commits over the past 12 months.',
  icon: 'code-commit',
  dataDisplay: NumericDataDisplay,
  sort: 'commitActivity_DESC',
  columnLabel: 'Commits (12M)',
};
