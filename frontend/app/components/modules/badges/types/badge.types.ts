// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export enum BadgeTier {
  BLACK = 'black',
  GOLD = 'gold',
  SILVER = 'silver',
  BRONZE = 'bronze',
}

export interface BadgeConfig {
  title: string;
  description: string;
  leaderboardKey: string;
  badgeImages: {
    [tier in BadgeTier]: string;
  };
}

export interface ProjectBadge {
  config: BadgeConfig;
  tier: BadgeTier;
  rank: number;
  percentile: number;
}
