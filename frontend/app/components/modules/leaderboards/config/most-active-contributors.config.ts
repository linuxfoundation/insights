// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import IntegerDataDisplay from '../components/data-displays/integer.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const mostActiveContributorsConfig: LeaderboardConfig = {
  key: 'active-contributors',
  name: 'Most active contributors',
  description:
    'These projects attracted the highest number of unique contributors over the past 12 months.',
  icon: 'people-group',
  dataDisplay: IntegerDataDisplay,
  columnLabel: 'Contributors (12m)',
  seoTitle: 'Open Source Projects With Most Active Contributors',
  seoDescription:
    'Leaderboard of open source projects with the highest number of unique contributors over the past 12 months.',
};
