// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxProjectIntegerRowDisplay from '../components/row-displays/project-integer.vue';
import LfxProjectIntegerMinimizedRowDisplay from '../components/minimize-row-displays/project-integer.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const commitActivityConfig: LeaderboardConfig = {
  key: 'commit-activity',
  name: 'Commit activity',
  description:
    'These projects recorded the most commits during the past 12 months, showing high development momentum.',
  icon: 'code-commit',
  dataDisplay: LfxProjectIntegerRowDisplay,
  minimizedDataDisplay: LfxProjectIntegerMinimizedRowDisplay,
  entityLabel: 'Project',
  metricLabel: 'Commits (12M)',
};
