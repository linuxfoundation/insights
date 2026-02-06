// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier } from '../types/badge.types';
import { blackTierConfig } from './tiers/black.config';
import { goldTierConfig } from './tiers/gold.config';
import { silverTierConfig } from './tiers/silver.config';
import { bronzeTierConfig } from './tiers/bronze.config';

export interface TierConfig {
  label: string;
  min: number;
  max: number;
  color: string;
}

export const getTierTagStyle = (color: string) => ({
  background: `radial-gradient(ellipse at 85% 90%, rgba(0,0,0,0.23) 0%, rgba(0,0,0,0) 86%), radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.41) 0%, rgba(255,255,255,0) 70%), ${color}`,
  textShadow: '1px 1px 1px rgba(0, 0, 0, 0.25)',
});

export const tierConfigs: Record<BadgeTier, TierConfig> = {
  [BadgeTier.BLACK]: blackTierConfig,
  [BadgeTier.GOLD]: goldTierConfig,
  [BadgeTier.SILVER]: silverTierConfig,
  [BadgeTier.BRONZE]: bronzeTierConfig,
};

export const getBadgeTierFromPercentile = (percentile: number): BadgeTier | null => {
  if (percentile <= tierConfigs[BadgeTier.BLACK].max) return BadgeTier.BLACK;
  if (percentile <= tierConfigs[BadgeTier.GOLD].max) return BadgeTier.GOLD;
  if (percentile <= tierConfigs[BadgeTier.SILVER].max) return BadgeTier.SILVER;
  if (percentile <= tierConfigs[BadgeTier.BRONZE].max) return BadgeTier.BRONZE;
  return null; // No badge if below top 50%
};
