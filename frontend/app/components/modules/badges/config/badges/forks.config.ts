// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier, type BadgeConfig } from '../../types/badge.types';

export const forksBadgeConfig: BadgeConfig = {
  title: 'Forks',
  description: 'Ranking based on total repository forks',
  leaderboardKey: 'forks',
  badgeImages: {
    [BadgeTier.BRONZE]: '/images/badges/forks/bronze.png',
    [BadgeTier.SILVER]: '/images/badges/forks/silver.png',
    [BadgeTier.GOLD]: '/images/badges/forks/gold.png',
    [BadgeTier.BLACK]: '/images/badges/forks/black.png',
  },
};
