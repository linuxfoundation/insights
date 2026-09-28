// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import LfxIcon from '~/components/uikit/icon/icon.vue';

import LfxHealthBreakdownCategoryCard from '../health-breakdown/category-card.vue';
import LfxProjectTrustScoreV2 from '../trust-score-v2.vue';

const stubs = {
  LfxSkeletonState: { template: '<div><slot /></div>' },
  LfxTooltip: {
    template:
      '<div class="tooltip-stub"><slot /><div class="tooltip-content"><slot name="content" /></div></div>',
  },
  LfxHealthScoreRing: true,
  LfxProjectTrustScoreShareBadge: true,
};

const mountTrustScore = (overrides: Record<string, unknown> = {}) =>
  mount(LfxProjectTrustScoreV2, {
    props: {
      healthScoreV2: 38,
      healthLabel: 'fair',
      impactScore: null,
      impactLabel: null,
      lifecycleLabel: 'active',
      maintainerHealthScoreV2: 22,
      securitySupplyChainScoreV2: 16,
      developmentActivityScoreV2: null,
      healthMaxScore: 75,
      status: 'success',
      isRepoSelected: false,
      signals: null,
      ...overrides,
    },
    global: { stubs },
  });

describe('partial Health Score (IN-1388)', () => {
  it('AC1: shows no question icon beside the band label on a partial score', () => {
    const wrapper = mountTrustScore();

    const questionIcons = wrapper
      .findAllComponents(LfxIcon)
      .filter((icon) => (icon.props() as { name?: string }).name === 'circle-question');
    // The only question icon is the HEALTH SCORE heading's info icon.
    expect(questionIcons).toHaveLength(1);
    expect(questionIcons[0]!.element.closest('span')?.textContent).toContain('HEALTH SCORE');
    expect(wrapper.text()).toContain('Fair*');
  });

  it('AC3: partial link tooltip names the missing category', () => {
    const development = mountTrustScore();
    expect(development.text()).toContain('Partial score (2/3 categories)');
    expect(development.text()).toContain(
      'because the Development Activity category is missing data',
    );

    const security = mountTrustScore({
      healthScoreV2: 52,
      healthLabel: 'healthy',
      healthMaxScore: 65,
      maintainerHealthScoreV2: 40,
      securitySupplyChainScoreV2: null,
      developmentActivityScoreV2: 12,
    });
    expect(security.text()).toContain(
      'because the Security & Supply Chain category is missing data',
    );
  });

  it('AC3: no partial link on a full score', () => {
    const wrapper = mountTrustScore({
      healthScoreV2: 85,
      healthLabel: 'excellent',
      healthMaxScore: 100,
      developmentActivityScoreV2: 20,
    });

    expect(wrapper.text()).not.toContain('Partial score');
    expect(wrapper.text()).not.toContain('Excellent*');
  });

  it('AC7: category card shows an em dash for a missing score', () => {
    const wrapper = mount(LfxHealthBreakdownCategoryCard, {
      props: {
        name: 'Development Activity',
        icon: 'laptop-code',
        score: null,
        maxScore: 25,
        color: 'positive',
        description: '',
        selected: false,
      },
    });

    expect(wrapper.text()).toContain('—');
    expect(wrapper.text()).not.toContain('/25');
    expect(wrapper.text()).not.toContain('No data');
  });
});
