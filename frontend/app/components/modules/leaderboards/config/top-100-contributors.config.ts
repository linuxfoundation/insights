// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import LfxContributorRowDisplay from '../components/row-displays/contributor-row.vue';
import LfxContributorMinimizedRowDisplay from '../components/minimize-row-displays/contributor-row.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const top100ContributorsConfig: LeaderboardConfig = {
  key: 'contributors',
  name: 'Top 100 contributors',
  description:
    'Developers ranked by volume of contributions over the last 12 months, highlighting the most active and influential individuals.',
  icon: 'head-side-gear',
  dataDisplay: LfxContributorRowDisplay,
  minimizedDataDisplay: LfxContributorMinimizedRowDisplay,
  entityLabel: 'Contributor',
  metricLabel: 'Contributions (12M)',
};
