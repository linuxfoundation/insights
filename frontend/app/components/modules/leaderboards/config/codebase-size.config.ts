// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import CodebaseSizeDataDisplay from '../components/data-displays/codebase-size.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const codebaseSizeConfig: LeaderboardConfig = {
  key: 'codebase-size',
  name: 'Codebase size',
  description:
    'These projects maintain the largest codebases measured by total source lines of code.',
  icon: 'laptop-code',
  dataDisplay: CodebaseSizeDataDisplay,
  columnLabel: 'Lines of code',
  seoTitle: 'Open Source Projects With Largest Codebase',
  seoDescription:
    'Leaderboard of open source projects that maintain the largest codebases measured by total source lines of code.',
};
