// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { describe, test, expect } from 'vitest';

import CollectionHealthScorePill from '~~/app/components/modules/collection/components/details/collection-health-score-pill.vue';
import CollectionImpactScorePill from '~~/app/components/modules/collection/components/details/collection-impact-score-pill.vue';
import CollectionLifecycleBadge from '~~/app/components/modules/collection/components/details/collection-lifecycle-badge.vue';
import LfxPopover from '~~/app/components/uikit/popover/popover.vue';
import LfxProgressBar from '~~/app/components/uikit/progress-bar/progress-bar.vue';
import LfxTag from '~~/app/components/uikit/tag/tag.vue';

describe('Collection detail pill components — IN-1239 regression suite', () => {
  describe('collection-lifecycle-badge.vue', () => {
    test('wraps chip in lfx-popover when lifecycleLabel is unavailable', () => {
      const wrapper = mount(CollectionLifecycleBadge, {
        props: { lifecycleLabel: undefined },
      });

      // fails before fix: popover wrapper was missing
      expect(wrapper.findComponent(LfxPopover).exists()).toBe(true);
      expect(wrapper.text()).toContain('Unavailable');
    });

    test('wraps tag in lfx-popover when lifecycleLabel is available', () => {
      const wrapper = mount(CollectionLifecycleBadge, {
        props: { lifecycleLabel: 'active' },
      });

      // fails before fix: popover wrapper was missing
      expect(wrapper.findComponent(LfxPopover).exists()).toBe(true);
      expect(wrapper.text()).toContain('active');
    });

    test('renders lifecycle label as a solid colored pill, not a bordered chip', () => {
      const wrapper = mount(CollectionLifecycleBadge, {
        props: { lifecycleLabel: 'active' },
      });

      // Lifecycle matches Figma as a solid tinted-background pill (lfx-tag solid) — no border, unlike Health Score/Impact's lfx-chip
      const tag = wrapper.findComponent(LfxTag);
      expect(tag.exists()).toBe(true);
      expect(tag.props('type')).toBe('solid');
      expect(tag.props('variation')).toBe('positive');
    });
  });

  describe('collection-health-score-pill.vue', () => {
    test('wraps chip in lfx-popover when unavailable is true', () => {
      const wrapper = mount(CollectionHealthScorePill, {
        props: { score: 75, unavailable: true },
      });

      // fails before fix: popover wrapper was missing
      expect(wrapper.findComponent(LfxPopover).exists()).toBe(true);
      expect(wrapper.text()).toContain('Unavailable');
    });

    test('wraps chip in lfx-popover when score is available', () => {
      const wrapper = mount(CollectionHealthScorePill, {
        props: { score: 85, unavailable: false },
      });

      // fails before fix: popover wrapper was missing
      expect(wrapper.findComponent(LfxPopover).exists()).toBe(true);
      expect(wrapper.text()).toContain('Excellent');
      expect(wrapper.text()).toContain('85');
    });

    test('shows correct health score band for different scores', () => {
      const testCases = [
        { score: 95, label: 'Excellent' },
        { score: 77, label: 'Healthy' },
        { score: 55, label: 'Fair' },
        { score: 40, label: 'Concerning' },
        { score: 15, label: 'Critical' },
      ];

      testCases.forEach(({ score, label }) => {
        const wrapper = mount(CollectionHealthScorePill, {
          props: { score, unavailable: false },
        });
        expect(wrapper.text()).toContain(label);
      });
    });

    // Renders the popover content inline so its partial-only markup can be asserted.
    const popoverStub = { LfxPopover: { template: '<div><slot /><slot name="content" /></div>' } };

    test('partial score shows asterisk, score/max, dotted missing segment and footnote', () => {
      const wrapper = mount(CollectionHealthScorePill, {
        props: {
          score: 52,
          healthLabel: 'healthy',
          healthMaxScore: 65,
          maintainerHealthScoreV2: 40,
          securitySupplyChainScoreV2: null,
          developmentActivityScoreV2: 12,
        },
        global: { stubs: popoverStub },
      });

      expect(wrapper.text()).toContain('Healthy*');
      expect(wrapper.text()).toContain('(52/65)');
      expect(wrapper.text()).toContain('—/35');
      expect(wrapper.text()).toContain(
        '*The Health score is partial because the Security & Supply Chain category is missing data for this project.',
      );
      expect(wrapper.findComponent(LfxProgressBar).props('missing')).toBe(35);
    });

    test('full score shows score/100 without partial markers', () => {
      const wrapper = mount(CollectionHealthScorePill, {
        props: {
          score: 85,
          healthLabel: 'excellent',
          healthMaxScore: 100,
          maintainerHealthScoreV2: 38,
          securitySupplyChainScoreV2: 27,
          developmentActivityScoreV2: 20,
        },
        global: { stubs: popoverStub },
      });

      expect(wrapper.text()).toContain('(85/100)');
      expect(wrapper.text()).not.toContain('*');
      expect(wrapper.text()).not.toContain('is partial because');
      expect(wrapper.findComponent(LfxProgressBar).props('missing')).toBeUndefined();
    });
  });

  describe('collection-impact-score-pill.vue', () => {
    test('wraps chip in lfx-popover when score is null', () => {
      const wrapper = mount(CollectionImpactScorePill, {
        props: { score: null },
      });

      // fails before fix: popover wrapper was missing
      expect(wrapper.findComponent(LfxPopover).exists()).toBe(true);
    });

    test('shows "Unavailable" instead of "N/A" when score is null', () => {
      const wrapper = mount(CollectionImpactScorePill, {
        props: { score: null },
      });

      // fails before fix: rendered "N/A" instead of "Unavailable"
      expect(wrapper.text()).toContain('Unavailable');
      expect(wrapper.text()).not.toContain('N/A');
    });

    test('wraps chip in lfx-popover when score is available', () => {
      const wrapper = mount(CollectionImpactScorePill, {
        props: { score: 90 },
      });

      // fails before fix: popover wrapper was missing
      expect(wrapper.findComponent(LfxPopover).exists()).toBe(true);
      expect(wrapper.text()).toContain('Foundational');
      expect(wrapper.text()).toContain('90');
    });

    test('shows correct impact tier for different scores', () => {
      const testCases = [
        { score: 90, label: 'Foundational' },
        { score: 70, label: 'Major' },
        { score: 50, label: 'Significant' },
        { score: 30, label: 'Moderate' },
        { score: 15, label: 'Limited' },
      ];

      testCases.forEach(({ score, label }) => {
        const wrapper = mount(CollectionImpactScorePill, {
          props: { score },
        });
        expect(wrapper.text()).toContain(label);
      });
    });

    test('renders "Limited" for legacy server-sent impactLabel "minor"', () => {
      // project_insights_copy.pipe still emits the old 'minor' vocabulary; must map to the new 'Limited' label, not render raw "minor"
      const wrapper = mount(CollectionImpactScorePill, {
        props: { score: 10, impactLabel: 'minor' },
      });

      expect(wrapper.text()).toContain('Limited');
      expect(wrapper.text()).not.toContain('minor');
    });
  });
});
