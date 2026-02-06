// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier, type BadgeConfig } from '../../types/badge.types';

export const packageDownloadsBadgeConfig: BadgeConfig = {
  title: 'Package downloads',
  description: 'Package downloads in the last 30 days',
  leaderboardKey: 'package-downloads',
  badgeImages: {
    [BadgeTier.BRONZE]: '/images/badges/package-downloads/bronze.png',
    [BadgeTier.SILVER]: '/images/badges/package-downloads/silver.png',
    [BadgeTier.GOLD]: '/images/badges/package-downloads/gold.png',
    [BadgeTier.BLACK]: '/images/badges/package-downloads/black.png',
  },
};
