// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxCodebaseSizeRowDisplay from '../components/row-displays/codebase-size-row.vue';
import LfxCodebaseSizeMinimizedRowDisplay from '../components/minimize-row-displays/codebase-size-row.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const codebaseSizeConfig: LeaderboardConfig = {
  key: 'codebase-size',
  name: 'Codebase size',
  description:
    'These projects maintain the largest codebases measured by total source lines of code.',
  icon: 'laptop-code',
  dataDisplay: LfxCodebaseSizeRowDisplay,
  minimizedDataDisplay: LfxCodebaseSizeMinimizedRowDisplay,
  entityLabel: 'Project',
  metricLabel: 'Lines of code',
};
