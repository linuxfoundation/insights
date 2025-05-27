// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

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
    label: 'Rock solid',
    color: 'bg-positive-500',
    ghBadgeColor: '#10B981'
  },
  {
    maxScore: 79,
    minScore: 60,
    label: 'Healthy',
    color: 'bg-positive-500',
    ghBadgeColor: '#A7F3D0'
  },
  {
    maxScore: 59,
    minScore: 40,
    label: 'Stable',
    color: 'bg-info-500',
    ghBadgeColor: '#0094FF'
  },
  {
    maxScore: 39,
    minScore: 20,
    label: 'Unsteady',
    color: 'bg-warning-500',
    ghBadgeColor: '#F59E0B'
  },
  {
    maxScore: 19,
    minScore: 0,
    label: 'Critical',
    color: 'bg-negative-500',
    ghBadgeColor: '#EF4444'
  }
];

export const getScoreBadgeUrl = (scoreConfig: TrustScoreConfig) => {
  const label = 'Health Score';
  const message = encodeURIComponent(scoreConfig.label);
  const color = scoreConfig.ghBadgeColor.replace('#', '');

  return getBadgeUrl(label, message, color);
};

export const getBadgeUrl = (label: string, message: string, color: string) => `https://img.shields.io/static/v1?label=${encodeURIComponent(
    label
  )}&message=${message}&color=${color}&logo=linuxfoundation&logoColor=white&style=flat`;
