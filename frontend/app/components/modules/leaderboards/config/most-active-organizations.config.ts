// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const mostActiveOrganizationsConfig: LeaderboardConfig = {
  key: 'active-organizations',
  name: 'Most active organizations',
  description:
    'These projects brought together the largest number of distinct contributing organizations in the past 12 months.',
  icon: 'buildings',
  dataDisplay: NumericDataDisplay,
  sort: 'mostActiveOrganizations_DESC',
  columnLabel: 'Organizations (12M)',
};
