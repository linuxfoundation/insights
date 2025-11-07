// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const top100OrganizationsConfig: LeaderboardConfig = {
  key: 'top-100-organizations',
  name: 'Top 100 organizations',
  description:
    'Most influential organizations based on the total number of contributions made over the last 10 years.',
  icon: 'chart-network',
  dataDisplay: NumericDataDisplay,
  columnLabel: 'Contributors (10y)',
  dataType: 'integer',
};
