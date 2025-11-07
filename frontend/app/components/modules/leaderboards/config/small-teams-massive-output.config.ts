// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import NumericDataDisplay from '../components/data-displays/numeric.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const smallTeamsMassiveOutputConfig: LeaderboardConfig = {
  key: 'small-teams-massive-output',
  name: 'Small teams, massive output ',
  description:
    'These projects demonstrate exceptional productivity, achieving the highest commit volumes with 50 or fewer contributors.',
  icon: 'arrow-up-big-small',
  dataDisplay: NumericDataDisplay,
  columnLabel: 'Commits',
  columnTooltip: 'For projects with ≤50 contributors',
  dataType: 'integer',
  seoTitle: 'Small Open Source Teams With Massive Output',
  seoDescription:
    'Leaderboard of open source projects achieving the highest commit volumes with 50 or fewer contributors.',
};
