// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Health Score v2 bands, in display order (best to worst). Matches `healthLabel` values produced by
// project_insights_copy.pipe (see config/trust-score.ts's healthScoreV2Config for the same labels).
export const healthScoreBands = [
  { key: 'excellent', label: 'Excellent' },
  { key: 'healthy', label: 'Healthy' },
  { key: 'fair', label: 'Fair' },
  { key: 'concerning', label: 'Concerning' },
  { key: 'critical', label: 'Critical' },
] as const;

export type HealthScoreBand = (typeof healthScoreBands)[number];
export type HealthScoreBandKey = HealthScoreBand['key'];
