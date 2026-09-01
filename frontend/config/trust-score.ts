// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { useRuntimeConfig } from '#imports';
import { lfxColors } from '~/config/styles/colors';

export const getBadgeUrl = (type: string, projectSlug: string, selectedRepos: string[] = []) => {
  const config = useRuntimeConfig();
  return `${config.public.appUrl}/api/badge/${type}?project=${projectSlug}${
    selectedRepos.length ? `&repos=${selectedRepos.join(',')}` : ''
  }`;
};

// v2 health score labels/colors, thresholds 85/70/50/30 (see project_insights_copy.pipe's
// healthLabel multiIf). Keyed lowercase to match the backend-provided healthLabel string
// (see collection-health-score-pill.vue).
export interface HealthScoreV2Config {
  label: string;
  ghBadgeColor: string;
}

export const healthScoreV2Config: Record<string, HealthScoreV2Config> = {
  excellent: { label: 'Excellent', ghBadgeColor: lfxColors.health.healthy },
  healthy: { label: 'Healthy', ghBadgeColor: lfxColors.health.healthy },
  fair: { label: 'Fair', ghBadgeColor: lfxColors.health.fair },
  concerning: { label: 'Concerning', ghBadgeColor: lfxColors.health.concerning },
  critical: { label: 'Critical', ghBadgeColor: lfxColors.health.critical },
  unavailable: { label: 'Unavailable', ghBadgeColor: lfxColors.neutral[400] },
};

export const getHealthScoreV2Config = (
  label: string | null,
  isPartial = false,
): HealthScoreV2Config => {
  const config =
    label && healthScoreV2Config[label]
      ? healthScoreV2Config[label]
      : healthScoreV2Config.unavailable;
  if (isPartial) {
    return { ...config, label: `${config.label} - Partial` };
  }
  return config;
};

// A Health Score is partial when exactly 1 of the 3 v2 categories (Maintainer Health,
// Security & Supply Chain, Development Activity) is missing data. project_insights.pipe already
// encodes this via healthMaxScore: 100 when all 3 categories are covered, null when fewer than 2
// are covered, and the capped denominator (60/65/75) when exactly one is missing - so this never
// needs to recompute category coverage itself.
export const isPartialHealthScore = (healthMaxScore: number | null): boolean =>
  healthMaxScore !== null && healthMaxScore !== 100;

// Health Score empty-state copy for the repo-selector states.
export const healthScoreFilterEmptyState = {
  stateSelectAll: {
    description: 'Select "All repositories" in order to get the aggregated Health Score',
  },
  stateUnavailable: {
    title: 'Health Score Unavailable',
    description: 'Health Score is unavailable for archived or excluded repositories.',
  },
};

// Impact labels come from project_insights_copy.pipe's impactLabel multiIf: foundational (>=80),
// major (>=60), significant (>=40), moderate (>=20), limited (below).
export const impactLabelConfig: Record<string, string> = {
  foundational: 'Foundational',
  major: 'Major',
  significant: 'Significant',
  moderate: 'Moderate',
  limited: 'Limited',
  // backward-compat: crowd.dev's project_insights_copy.pipe still emits 'minor'; remove once that pipe is updated to the new vocabulary
  minor: 'Limited',
};

export const getImpactLabelDisplay = (label: string | null): string => {
  if (label && impactLabelConfig[label]) {
    return impactLabelConfig[label];
  }
  return 'Unavailable';
};

// Lifecycle labels from health_score_v2's lifecycleLabelV2 (best-state-wins across repos).
export const lifecycleLabelConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-positive-500' },
  stable: { label: 'Stable', color: 'bg-accent-500' },
  declining: { label: 'Declining', color: 'bg-warning-500' },
  abandoned: { label: 'Abandoned', color: 'bg-negative-500' },
  inert: { label: 'Inert', color: 'bg-warning-600' },
  archived: { label: 'Archived', color: 'bg-neutral-400' },
};

export const getLifecycleLabelConfig = (label: string | null): { label: string; color: string } => {
  if (label && lifecycleLabelConfig[label]) {
    return lifecycleLabelConfig[label];
  }
  return { label: 'Unknown', color: 'bg-neutral-400' };
};
