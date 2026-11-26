// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import { Granularity } from '@lfx-insights/types';

import { calculateGranularity } from './project.store';

describe('calculateGranularity', () => {
  // End dates are exclusive, so the thresholds apply to the last picked day.
  it.each([
    ['Oct 1 to Oct 31 (31 days)', '2025-10-01', '2025-11-01', [Granularity.DAILY]],
    ['Oct 1 to Nov 1 (32 days)', '2025-10-01', '2025-11-02', [Granularity.WEEKLY]],
    ['Oct 1 to Dec 30', '2025-10-01', '2025-12-31', [Granularity.WEEKLY]],
    ['Oct 1 to Dec 31', '2025-10-01', '2026-01-01', [Granularity.WEEKLY, Granularity.MONTHLY]],
    [
      'Jan 1 2025 to Jan 1 2026',
      '2025-01-01',
      '2026-01-02',
      [Granularity.WEEKLY, Granularity.MONTHLY],
    ],
    [
      'Jan 1 2025 to Jan 2 2026',
      '2025-01-01',
      '2026-01-03',
      [Granularity.MONTHLY, Granularity.YEARLY],
    ],
    [
      'Jan 1 2025 to Jan 1 2027',
      '2025-01-01',
      '2027-01-02',
      [Granularity.MONTHLY, Granularity.YEARLY],
    ],
    ['Jan 1 2025 to Jan 2 2027', '2025-01-01', '2027-01-03', [Granularity.YEARLY]],
  ])('%s', (_name, start, end, expected) => {
    expect(calculateGranularity(start, end)).toEqual(expected);
  });

  it('falls back to weekly when a bound is missing', () => {
    expect(calculateGranularity(null, '2025-11-01')).toEqual([Granularity.WEEKLY]);
    expect(calculateGranularity('2025-10-01', null)).toEqual([Granularity.WEEKLY]);
  });
});
