// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const mostActiveOrganizationsConfig: LeaderboardConfig = {
  key: 'most-active-organizations',
  name: 'Most Active Organizations',
  icon: 'business-line',
  dataDisplay: NumericDataDisplay,
  sort: 'mostActiveOrganizations_DESC',
  columnLabel: 'Organizations (12M)',
};
