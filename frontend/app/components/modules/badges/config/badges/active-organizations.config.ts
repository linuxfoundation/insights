// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier, type BadgeConfig } from '../../types/badge.types';

export const activeOrganizationsBadgeConfig: BadgeConfig = {
  title: 'Active organizations',
  description: 'Unique organizations contributing in the last 12 months',
  leaderboardKey: 'active-organizations',
  badgeImages: {
    [BadgeTier.BRONZE]: '/images/badges/active-organizations/bronze.png',
    [BadgeTier.SILVER]: '/images/badges/active-organizations/silver.png',
    [BadgeTier.GOLD]: '/images/badges/active-organizations/gold.png',
    [BadgeTier.BLACK]: '/images/badges/active-organizations/black.png',
  },
};
