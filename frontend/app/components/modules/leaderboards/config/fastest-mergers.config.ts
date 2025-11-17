// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import DurationDataDisplay from '../components/data-displays/duration.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const fastestMergersConfig: LeaderboardConfig = {
  key: 'fastest-mergers',
  name: 'Fastest mergers',
  description: 'These projects merge pull requests the fastest over the past 12 months.',
  icon: 'code-merge',
  dataDisplay: DurationDataDisplay,
  columnLabel: 'Median time to merge (12m)',
  seoTitle: 'Open Source Projects With Fastest Mergers',
  seoDescription: 'Leaderboard of open source projects that merge pull requests the fastest.',
};
