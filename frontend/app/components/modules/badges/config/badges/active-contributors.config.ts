// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier, type BadgeConfig } from '../../types/badge.types';

export const activeContributorsBadgeConfig: BadgeConfig = {
  title: 'Active contributors',
  description: 'Unique contributors contributing in the last 12 months',
  leaderboardKey: 'active-contributors',
  badgeImages: {
    [BadgeTier.BRONZE]: '/images/badges/active-contributors/bronze.png',
    [BadgeTier.SILVER]: '/images/badges/active-contributors/silver.png',
    [BadgeTier.GOLD]: '/images/badges/active-contributors/gold.png',
    [BadgeTier.BLACK]: '/images/badges/active-contributors/black.png',
  },
};
