// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxCollectionHealthScorePill from '@/components/modules/collection/components/details/collection-health-score-pill.vue';

export default {
  title: 'LinuxFoundation/Collection/HealthScorePill',
  component: LfxCollectionHealthScorePill,
  tags: ['autodocs'],
  argTypes: {
    score: { description: 'Health score total', control: 'number' },
    healthLabel: { description: 'Server-computed health band', control: 'text' },
    healthMaxScore: {
      description: 'Max achievable score (below 100 when a category is missing)',
      control: 'number',
    },
    maintainerHealthScoreV2: {
      description: 'Maintainer Health score (out of 40)',
      control: 'number',
    },
    securitySupplyChainScoreV2: {
      description: 'Security & Supply Chain score (out of 35)',
      control: 'number',
    },
    developmentActivityScoreV2: {
      description: 'Development Activity score (out of 25)',
      control: 'number',
    },
    unavailable: { description: 'Shows the unavailable state', control: 'boolean' },
  },
  decorators: [() => ({ template: '<div class="p-4 pt-80"><story /></div>' })],
};

export const PartialSecurityMissing = {
  args: {
    score: 52,
    healthLabel: 'healthy',
    healthMaxScore: 65,
    maintainerHealthScoreV2: 40,
    securitySupplyChainScoreV2: null,
    developmentActivityScoreV2: 12,
  },
};

export const PartialDevelopmentMissing = {
  args: {
    score: 38,
    healthLabel: 'fair',
    healthMaxScore: 75,
    maintainerHealthScoreV2: 22,
    securitySupplyChainScoreV2: 16,
    developmentActivityScoreV2: null,
  },
};

export const Full = {
  args: {
    score: 39,
    healthLabel: 'concerning',
    healthMaxScore: 100,
    maintainerHealthScoreV2: 15,
    securitySupplyChainScoreV2: 14,
    developmentActivityScoreV2: 10,
  },
};
