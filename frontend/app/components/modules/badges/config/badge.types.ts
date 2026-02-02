// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'black';

export interface BadgeConfig {
  title: string;
  description: string;
  icon: string;
  leaderboardKey: string;
}

export interface ProjectBadge {
  config: BadgeConfig;
  tier: BadgeTier;
  rank: number;
  percentile: number;
}

export const BADGE_TIER_THRESHOLDS = {
  black: { min: 0, max: 1 }, // Top 1%
  gold: { min: 1, max: 10 }, // Top 1-10%
  silver: { min: 10, max: 25 }, // Top 10-25%
  bronze: { min: 25, max: 50 }, // Top 25-50%
} as const;

export const getBadgeTierFromPercentile = (percentile: number): BadgeTier | null => {
  if (percentile <= BADGE_TIER_THRESHOLDS.black.max) return 'black';
  if (percentile <= BADGE_TIER_THRESHOLDS.gold.max) return 'gold';
  if (percentile <= BADGE_TIER_THRESHOLDS.silver.max) return 'silver';
  if (percentile <= BADGE_TIER_THRESHOLDS.bronze.max) return 'bronze';
  return null; // No badge if below top 50%
};
