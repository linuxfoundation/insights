// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { TierConfig } from '../tiers.config';

export const blackTierConfig: TierConfig = {
  label: 'Black',
  min: 0,
  max: 1, // Top 1%
  gradient: {
    from: '#1d2b45',
    to: '#8f97a2',
  },
};
