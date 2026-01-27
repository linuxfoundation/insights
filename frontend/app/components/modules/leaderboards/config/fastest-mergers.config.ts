// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxProjectDurationRowDisplay from '../components/row-displays/project-duration.vue';
import LfxProjectDurationMinimizedRowDisplay from '../components/minimize-row-displays/project-duration.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const fastestMergersConfig: LeaderboardConfig = {
  key: 'fastest-mergers',
  name: 'Fastest mergers',
  description: 'These projects merge pull requests the fastest over the past 12 months.',
  icon: 'code-merge',
  dataDisplay: LfxProjectDurationRowDisplay,
  minimizedDataDisplay: LfxProjectDurationMinimizedRowDisplay,
  entityLabel: 'Project',
  metricLabel: 'Median time to merge (12M)',
};
