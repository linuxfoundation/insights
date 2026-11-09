// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxProjectIntegerMinimizedRowDisplay from '../components/minimize-row-displays/project-integer.vue';
import LfxProjectIntegerRowDisplay from '../components/row-displays/project-integer.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const mostActiveOrganizationsConfig: LeaderboardConfig = {
  key: 'active-organizations',
  name: 'Most active companies',
  description:
    'These projects brought together the largest number of distinct contributing companies in the past 12 months.',
  icon: 'buildings',
  dataDisplay: LfxProjectIntegerRowDisplay,
  minimizedDataDisplay: LfxProjectIntegerMinimizedRowDisplay,
  entityLabel: 'Project',
  metricLabel: 'Companies (12M)',
};
