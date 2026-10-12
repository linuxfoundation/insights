// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import HealthScore from '../health-score.vue';

// Renders the tooltip content inline unless the tooltip is disabled, so no hover is needed.
const mountScore = (props: { label: string; healthMaxScore?: number | null }) =>
  mount(HealthScore, {
    props,
    global: {
      stubs: {
        LfxTooltip: {
          props: ['disabled'],
          template: '<div><slot /><slot v-if="!disabled" name="content" /></div>',
        },
      },
    },
  });

describe('health-score.vue', () => {
  it.each([
    ['excellent', 'Excellent', 'positive-solid'],
    ['healthy', 'Healthy', 'positive'],
    ['fair', 'Fair', 'accent'],
    ['concerning', 'Concerning', 'warning'],
    ['critical', 'Critical', 'negative-solid'],
  ])('renders the %s label with the %s tag variation', (label, text, variation) => {
    const wrapper = mountScore({ label });

    expect(wrapper.find('.c-tag').text()).toBe(text);
    expect(wrapper.find(`.c-tag--${variation}`).exists()).toBe(true);
  });

  it('matches the label case-insensitively', () => {
    const wrapper = mountScore({ label: 'Fair' });

    expect(wrapper.find('.c-tag').text()).toBe('Fair');
    expect(wrapper.find('.c-tag--accent').exists()).toBe(true);
  });

  it.each([null, undefined, 100])(
    'shows no asterisk or explanation for a healthMaxScore of %s',
    (max) => {
      const wrapper = mountScore({ label: 'excellent', healthMaxScore: max });

      expect(wrapper.find('.c-tag').text()).toBe('Excellent');
      expect(wrapper.text()).not.toContain('partial');
    },
  );

  it.each([
    [60, 'Maintainer Health'],
    [65, 'Security & Supply Chain'],
    [75, 'Development Activity'],
  ])('marks a healthMaxScore of %i as partial and names %s', (max, category) => {
    const wrapper = mountScore({ label: 'excellent', healthMaxScore: max });

    expect(wrapper.find('.c-tag').text()).toBe('Excellent*');
    expect(wrapper.find('.c-tag--positive-solid').exists()).toBe(true);
    expect(wrapper.text()).toContain(`the ${category} category is missing data`);
  });

  it('wraps the tag in the real tooltip trigger', () => {
    const wrapper = mount(HealthScore, { props: { label: 'excellent', healthMaxScore: 75 } });

    expect(wrapper.find('.c-popover__trigger .c-tag').text()).toBe('Excellent*');
  });

  it('renders nothing for an unknown label instead of defaulting to Critical', () => {
    const wrapper = mountScore({ label: 'unknown', healthMaxScore: 75 });

    expect(wrapper.find('.c-tag').exists()).toBe(false);
    expect(wrapper.text()).toBe('');
  });
});
