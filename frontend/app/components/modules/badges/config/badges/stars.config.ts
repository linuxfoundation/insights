// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier, type BadgeConfig } from '../../types/badge.types';

export const starsBadgeConfig: BadgeConfig = {
  title: 'GitHub Stars',
  description: 'Ranking based on total GitHub stars',
  leaderboardKey: 'stars',
  badgeImages: {
    [BadgeTier.BRONZE]: '/images/badges/stars/bronze.png',
    [BadgeTier.SILVER]: '/images/badges/stars/silver.png',
    [BadgeTier.GOLD]: '/images/badges/stars/gold.png',
    [BadgeTier.BLACK]: '/images/badges/stars/black.png',
  },
};
