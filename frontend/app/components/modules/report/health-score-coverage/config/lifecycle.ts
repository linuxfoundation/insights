// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Health Score v2 lifecycle labels, in display order. Matches `lifecycleLabel` values produced by
// health_score_v2_repo_copy_ds (see config/trust-score.ts's lifecycleLabelConfig for the same
// labels). `unavailable` covers projects with a NULL lifecycleLabel.
export const healthScoreLifecycleLabels = [
  { key: 'active', label: 'Active' },
  { key: 'stable', label: 'Stable' },
  { key: 'declining', label: 'Declining' },
  { key: 'inert', label: 'Inert' },
  { key: 'abandoned', label: 'Abandoned' },
  { key: 'archived', label: 'Archived' },
  { key: 'unavailable', label: 'Unavailable' },
] as const;

export type HealthScoreLifecycleLabel = (typeof healthScoreLifecycleLabels)[number];
export type HealthScoreLifecycleLabelKey = HealthScoreLifecycleLabel['key'];
