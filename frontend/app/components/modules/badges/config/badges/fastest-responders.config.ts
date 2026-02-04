// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier, type BadgeConfig } from '../../types/badge.types';

export const fastestRespondersBadgeConfig: BadgeConfig = {
  title: 'Fastest Responders',
  description: 'Ranking based on issue response time',
  leaderboardKey: 'fastest-responders',
  badgeImages: {
    [BadgeTier.BRONZE]: '/images/badges/response-time/bronze.png',
    [BadgeTier.SILVER]: '/images/badges/response-time/silver.png',
    [BadgeTier.GOLD]: '/images/badges/response-time/gold.png',
    [BadgeTier.BLACK]: '/images/badges/response-time/black.png',
  },
};
