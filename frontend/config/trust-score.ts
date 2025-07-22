// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import {useRuntimeConfig} from "#imports";

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
  return lfxTrustScore.find(
      (s) => score <= s.maxScore && score >= s.minScore
  ) || lfxTrustScore.at(-1)!
};
