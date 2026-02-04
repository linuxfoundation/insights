// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { TierConfig } from '../tiers.config';

export const goldTierConfig: TierConfig = {
  label: 'Gold',
  min: 1,
  max: 10, // Top 1-10%
  tagClasses: 'bg-warning-500 text-white',
};
