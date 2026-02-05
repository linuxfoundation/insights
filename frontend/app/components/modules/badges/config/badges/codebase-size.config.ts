// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier, type BadgeConfig } from '../../types/badge.types';

export const codebaseSizeBadgeConfig: BadgeConfig = {
  title: 'Codebase size',
  description: 'Count of source lines of code',
  leaderboardKey: 'codebase-size',
  badgeImages: {
    [BadgeTier.BRONZE]: '/images/badges/code-size/bronze.png',
    [BadgeTier.SILVER]: '/images/badges/code-size/silver.png',
    [BadgeTier.GOLD]: '/images/badges/code-size/gold.png',
    [BadgeTier.BLACK]: '/images/badges/code-size/black.png',
  },
};
