// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BadgeTier } from '../types/badge.types';
import { blackTierConfig } from './tiers/black.config';
import { goldTierConfig } from './tiers/gold.config';
import { silverTierConfig } from './tiers/silver.config';
import { bronzeTierConfig } from './tiers/bronze.config';

export interface TierGradient {
  from: string;
  to: string;
}

export interface TierConfig {
  label: string;
  min: number;
  max: number;
  gradient: TierGradient;
}

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
