// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import HealthScore from '../health-score.vue';

describe('health-score.vue', () => {
  it.each([
    ['excellent', 'Excellent', 'positive-solid'],
    ['healthy', 'Healthy', 'positive'],
    ['fair', 'Fair', 'accent'],
    ['concerning', 'Concerning', 'warning'],
    ['critical', 'Critical', 'negative-solid'],
  ])('renders the %s label with the %s tag variation', (label, text, variation) => {
    const wrapper = mount(HealthScore, { props: { label } });

    expect(wrapper.text()).toContain(text);
    expect(wrapper.find(`.c-tag--${variation}`).exists()).toBe(true);
  });

  it('matches the label case-insensitively', () => {
    const wrapper = mount(HealthScore, { props: { label: 'Fair' } });

    expect(wrapper.text()).toContain('Fair');
    expect(wrapper.find('.c-tag--accent').exists()).toBe(true);
  });

  it('renders the unavailable tag when unavailable is set', () => {
    const wrapper = mount(HealthScore, { props: { label: 'critical', unavailable: true } });

    expect(wrapper.text()).toContain('Unavailable');
    expect(wrapper.find('.c-tag--negative-solid').exists()).toBe(false);
  });

  it('renders nothing for an unknown label instead of defaulting to Critical', () => {
    const wrapper = mount(HealthScore, { props: { label: 'unknown' } });

    expect(wrapper.text()).toBe('');
    expect(wrapper.find('.c-tag').exists()).toBe(false);
  });
});
