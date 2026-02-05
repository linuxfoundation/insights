// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { TierConfig } from '../tiers.config';

export const silverTierConfig: TierConfig = {
  label: 'Silver',
  min: 10,
  max: 25, // Top 10-25%
  gradient: {
    from: '#9fa3ad',
    to: '#d5d5d5',
  },
};
