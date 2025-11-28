// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxProjectDecimalRowDisplay from '../components/row-displays/project-decimal.vue';
import LfxProjectDecimalMinimizedRowDisplay from '../components/minimize-row-displays/project-decimal.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const resolutionRateConfig: LeaderboardConfig = {
  key: 'resolution-rate',
  name: 'Highest resolution rate',
  description:
    'These projects keep development flowing, with most pull requests merged relative to issues opened.',
  icon: 'rocket-launch',
  dataDisplay: LfxProjectDecimalRowDisplay,
  minimizedDataDisplay: LfxProjectDecimalMinimizedRowDisplay,
  entityLabel: 'Project',
  metricLabel: 'PR/Issue ratio',
};
