// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import IntegerDataDisplay from '../components/data-displays/integer.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const mostActiveOrganizationsConfig: LeaderboardConfig = {
  key: 'active-organizations',
  name: 'Most active organizations',
  description:
    'These projects brought together the largest number of distinct contributing organizations in the past 12 months.',
  icon: 'buildings',
  dataDisplay: IntegerDataDisplay,
  columnLabel: 'Organizations (12m)',
  seoTitle: 'Open Source Projects With Most Active Organizations',
  seoDescription:
    'Leaderboard of open source projects with the largest number of distinct contributing organizations in the past 12 months.',
};
