// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import TimeDurationDisplay from '../components/data-displays/time-duration.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const fastestMergersConfig: LeaderboardConfig = {
  key: 'fastest-mergers',
  name: 'Fastest mergers',
  description: 'These projects merge pull requests the fastest over the past 12 months.',
  icon: 'code-merge',
  dataDisplay: TimeDurationDisplay,
  columnLabel: 'Median time to merge (12M)',
  isDataDuration: true,
};
