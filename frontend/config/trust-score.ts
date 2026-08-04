// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { useRuntimeConfig } from '#imports';

export interface TrustScoreConfig {
  maxScore: number;
  minScore: number;
  label: string;
  color: string;
  ghBadgeColor: string;
}

export const lfxTrustScore: TrustScoreConfig[] = [
  {
    maxScore: 100,
    minScore: 80,
    label: 'Excellent',
    color: 'bg-positive-500',
    ghBadgeColor: '#10B981',
  },
  {
    maxScore: 79,
    minScore: 60,
    label: 'Healthy',
    color: 'bg-positive-500',
    ghBadgeColor: '#A7F3D0',
  },
  {
    maxScore: 59,
    minScore: 40,
    label: 'Stable',
    color: 'bg-brand-500',
    ghBadgeColor: '#0094FF',
  },
  {
    maxScore: 39,
    minScore: 20,
    label: 'Unsteady',
    color: 'bg-warning-500',
    ghBadgeColor: '#F59E0B',
  },
  {
    maxScore: 19,
    minScore: 0,
    label: 'Critical',
    color: 'bg-negative-500',
    ghBadgeColor: '#EF4444',
  },
];

export const getBadgeUrl = (type: string, projectSlug: string, selectedRepos: string[] = []) => {
  const config = useRuntimeConfig();
  return `${config.public.appUrl}/api/badge/${type}?project=${projectSlug}${
    selectedRepos.length ? `&repos=${selectedRepos.join(',')}` : ''
  }`;
};
export const getHealthScoreConfig = (score: number) => {
  return (
    lfxTrustScore.find((s) => score <= s.maxScore && score >= s.minScore) || lfxTrustScore.at(-1)!
  );
};

// v2 health score labels/colors (IN-1212). Distinct from lfxTrustScore's v1 tiers: v2 uses
// excellent/healthy/fair/concerning/critical (see collection-health-score-pill.vue, IN-1191)
// instead of v1's Excellent/Healthy/Stable/Unsteady/Critical.
export interface HealthScoreV2Config {
  label: string;
  ghBadgeColor: string;
}

export const healthScoreV2Config: Record<string, HealthScoreV2Config> = {
  excellent: { label: 'Excellent', ghBadgeColor: '#10B981' },
  healthy: { label: 'Healthy', ghBadgeColor: '#A7F3D0' },
  fair: { label: 'Fair', ghBadgeColor: '#0094FF' },
  concerning: { label: 'Concerning', ghBadgeColor: '#F59E0B' },
  critical: { label: 'Critical', ghBadgeColor: '#EF4444' },
};

export const getHealthScoreV2Config = (label: string | null): HealthScoreV2Config => {
  if (label && healthScoreV2Config[label]) {
    return healthScoreV2Config[label];
  }
  return healthScoreV2Config.critical;
};
