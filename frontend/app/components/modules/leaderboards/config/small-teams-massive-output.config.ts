// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxProjectIntegerRowDisplay from '../components/row-displays/project-integer.vue';
import LfxProjectIntegerMinimizedRowDisplay from '../components/minimize-row-displays/project-integer.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const smallTeamsMassiveOutputConfig: LeaderboardConfig = {
  key: 'small-teams-massive-output',
  name: 'Small teams, massive output ',
  description:
    'These projects demonstrate exceptional productivity, achieving the highest commit volumes with 50 or fewer contributors.',
  icon: 'arrow-up-big-small',
  dataDisplay: LfxProjectIntegerRowDisplay,
  minimizedDataDisplay: LfxProjectIntegerMinimizedRowDisplay,
  entityLabel: 'Project',
  metricLabel: 'Commits',
  metricTooltip: 'For projects with ≤50 contributors',
};
