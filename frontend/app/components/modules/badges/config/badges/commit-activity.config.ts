// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier, type BadgeConfig } from '../../types/badge.types';

export const commitActivityBadgeConfig: BadgeConfig = {
  title: 'Commit Activity',
  description: 'Ranking based on commit frequency',
  leaderboardKey: 'commit-activity',
  badgeImages: {
    [BadgeTier.BRONZE]: '/images/badges/commit/bronze.png',
    [BadgeTier.SILVER]: '/images/badges/commit/silver.png',
    [BadgeTier.GOLD]: '/images/badges/commit/gold.png',
    [BadgeTier.BLACK]: '/images/badges/commit/black.png',
  },
};
