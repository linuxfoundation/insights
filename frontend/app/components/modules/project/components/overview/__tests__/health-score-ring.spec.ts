// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import LfxHealthScoreRing from '../trust-score/health-score-ring.vue';

const R = 54;
const INSET = 6 / (2 * Math.PI * R);

const mountRing = (score: number, maxScore: number) =>
  mount(LfxHealthScoreRing, {
    props: { score, maxScore },
    global: { stubs: { LfxChart: true } },
  });

// Clockwise fraction of the circle (0 at 12 o'clock) for an SVG point on the ring.
const fractionAt = (x: number, y: number) => {
  const angle = Math.atan2(x - 56, 56 - y);
  return (angle < 0 ? angle + 2 * Math.PI : angle) / (2 * Math.PI);
};

const arcEnds = (d: string) => {
  const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  return {
    start: fractionAt(nums[0]!, nums[1]!),
    end: fractionAt(nums[nums.length - 2]!, nums[nums.length - 1]!),
  };
};

describe('LfxHealthScoreRing partial overlay', () => {
  it.each([60, 65, 75])('insets the dotted arc from max %i to 100', (max) => {
    const path = mountRing(max - 10, max).find('path');
    const { start, end } = arcEnds(path.attributes('d')!);
    expect(start).toBeCloseTo(max / 100 + INSET, 4);
    expect(end).toBeCloseTo(1 - INSET, 4);
  });

  it('keeps the first dot clear of the score arc when score equals max', () => {
    const path = mountRing(65, 65).find('path');
    expect(arcEnds(path.attributes('d')!).start).toBeGreaterThan(0.65);
  });

  it('renders no dotted overlay for a full score', () => {
    const wrapper = mountRing(33, 100);
    expect(wrapper.find('path').exists()).toBe(false);
    expect(wrapper.text()).toContain('out of 100');
  });
});
