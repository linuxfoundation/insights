// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxProjectIntegerRowDisplay from '../components/row-displays/project-integer.vue';
import LfxProjectIntegerMinimizedRowDisplay from '../components/minimize-row-displays/project-integer.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const packageDownloadsConfig: LeaderboardConfig = {
  key: 'package-downloads',
  name: 'Package downloads',
  description:
    'Projects ranked by package downloads in the last month, showcasing tools with strong real-world adoption by the developer community.',
  icon: 'file-zipper',
  dataDisplay: LfxProjectIntegerRowDisplay,
  minimizedDataDisplay: LfxProjectIntegerMinimizedRowDisplay,
  entityLabel: 'Project',
  metricLabel: 'Package downloads (30D)',
};
