// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HealthScore from '../health-score.vue';

describe('health-score.vue', () => {
  it('renders the Fair band with the accent tag variation', () => {
    const wrapper = mount(HealthScore, { props: { score: 60 } });

    expect(wrapper.text()).toContain('Fair');
    expect(wrapper.find('.c-tag--accent').exists()).toBe(true);
  });
});
