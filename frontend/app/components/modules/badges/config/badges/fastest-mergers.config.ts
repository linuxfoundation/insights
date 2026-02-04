// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier, type BadgeConfig } from '../../types/badge.types';

export const fastestMergersBadgeConfig: BadgeConfig = {
  title: 'Fastest Mergers',
  description: 'Ranking based on PR merge time',
  leaderboardKey: 'fastest-mergers',
  badgeImages: {
    [BadgeTier.BRONZE]: '/images/badges/merge-time/bronze.png',
    [BadgeTier.SILVER]: '/images/badges/merge-time/silver.png',
    [BadgeTier.GOLD]: '/images/badges/merge-time/gold.png',
    [BadgeTier.BLACK]: '/images/badges/merge-time/black.png',
  },
};
