// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { TierConfig } from '../tiers.config';

export const bronzeTierConfig: TierConfig = {
  label: 'Bronze',
  min: 25,
  max: 50, // Top 25-50%
  gradient: {
    from: '#b97a50',
    to: '#e8c08d',
  },
};
