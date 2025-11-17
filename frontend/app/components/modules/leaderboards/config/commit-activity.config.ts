// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import IntegerDataDisplay from '../components/data-displays/integer.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const commitActivityConfig: LeaderboardConfig = {
  key: 'commit-activity',
  name: 'Commit activity',
  description:
    'These projects recorded the most commits during the past 12 months, showing high development momentum.',
  icon: 'code-commit',
  dataDisplay: IntegerDataDisplay,
  columnLabel: 'Commits (12m)',
  seoTitle: 'Open Source Projects With Highest Commit Activity',
  seoDescription:
    'Leaderboard of open source projects with the most commits during the past 12 months.',
};
