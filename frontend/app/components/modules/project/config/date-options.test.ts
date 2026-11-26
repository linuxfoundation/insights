// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { dateOptKeys, endDateAfter, lastDayOf, lfxProjectDateOptions } from './date-options';

const option = (key: dateOptKeys) => lfxProjectDateOptions.find((item) => item.key === key)!;

describe('date range end dates', () => {
  it('reads the last day of a range as the day before its end date', () => {
    expect(lastDayOf('2026-01-01').toISODate()).toBe('2025-12-31');
    expect(lastDayOf('2024-03-01').toISODate()).toBe('2024-02-29');
  });

  it('ends a range at the day after its last day', () => {
    expect(endDateAfter(DateTime.fromISO('2025-12-31'))).toBe('2026-01-01');
    expect(endDateAfter(DateTime.fromISO('2024-02-28'))).toBe('2024-02-29');
  });

  it('ends the previous quarter at the start of this quarter, so its last day is included', () => {
    const now = DateTime.local();
    const previousQuarter = option(dateOptKeys.previousQuarter);

    expect(previousQuarter.endDate).toBe(now.startOf('quarter').toFormat('yyyy-MM-dd'));
    expect(lastDayOf(previousQuarter.endDate!).toISODate()).toBe(
      now.minus({ quarters: 1 }).endOf('quarter').toISODate(),
    );
  });

  it.each([dateOptKeys.previousYear, dateOptKeys.previous5Year, dateOptKeys.previous10Year])(
    'ends %s on January 1 of this year, after December 31 of the last',
    (key) => {
      const now = DateTime.local();

      expect(option(key).endDate).toBe(now.startOf('year').toFormat('yyyy-MM-dd'));
      expect(lastDayOf(option(key).endDate!).toISODate()).toBe(`${now.year - 1}-12-31`);
    },
  );

  it('ends the past-days ranges at today, so they cover full days up to today', () => {
    const today = DateTime.local().toFormat('yyyy-MM-dd');

    expect(option(dateOptKeys.past90days).endDate).toBe(today);
    expect(option(dateOptKeys.past365days).endDate).toBe(today);
  });
});
