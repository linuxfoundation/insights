// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxOrganizationRowDisplay from '../components/row-displays/organization-row.vue';
import LfxOrganizationMinimizedRowDisplay from '../components/minimize-row-displays/organization-row.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const top100OrganizationsConfig: LeaderboardConfig = {
  key: 'organizations',
  name: 'Top 100 organizations',
  description:
    'Most influential organizations based on the total number of contributions made over the last 12 months.',
  icon: 'building-flag',
  dataDisplay: LfxOrganizationRowDisplay,
  minimizedDataDisplay: LfxOrganizationMinimizedRowDisplay,
  entityLabel: 'Organization',
  metricLabel: 'Contributions (12M)',
};
