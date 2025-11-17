// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import DurationDataDisplay from '../components/data-displays/duration.vue';
import type { LeaderboardConfig } from './types/leaderboard.types';

export const fastestRespondersConfig: LeaderboardConfig = {
  key: 'fastest-responders',
  name: 'Fastest responders',
  description:
    'These projects achieve the shortest median time to first response on issues over the past 12 months.',
  icon: 'comment-check',
  dataDisplay: DurationDataDisplay,
  columnLabel: 'Median time to 1st response (12m)',
  seoTitle: 'Open Source Projects With Fastest Responders',
  seoDescription:
    'Leaderboard of open source projects with the shortest median time to first response on issues.',
};
