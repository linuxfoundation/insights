// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { describe, test, expect, vi } from 'vitest';

import { calculatePercentageChange, earliestPossibleStartDate, getPreviousDates } from './util';

describe('getPreviousDates', () => {
  test('should return a comparison period that ends where the current one starts', () => {
    const currentStartDate = DateTime.utc(2025, 1, 10);
    const currentEndDate = DateTime.utc(2025, 1, 15);

    const result = getPreviousDates(currentStartDate, currentEndDate);

    const expectedStartDate = DateTime.utc(2025, 1, 5);
    const expectedEndDate = DateTime.utc(2025, 1, 10);

    expect(result).toEqual({
      current: {
        from: currentStartDate,
        to: currentEndDate,
      },
      previous: {
        from: expectedStartDate,
        to: expectedEndDate,
      },
    });
  });

  test('should return the earliest possible startDate when no startDate is provided', () => {
    const currentStartDate = undefined;
    const currentEndDate = DateTime.utc(2025, 1, 1);

    const result = getPreviousDates(currentStartDate, currentEndDate);

    const expectedCurrentStartDate = earliestPossibleStartDate;

    const expectedPreviousStartDate = DateTime.utc(1995, 1, 1);
    const expectedPreviousEndDate = earliestPossibleStartDate;

    expect(result).toEqual({
      current: {
        from: expectedCurrentStartDate,
        to: currentEndDate,
      },
      previous: {
        from: expectedPreviousStartDate,
        to: expectedPreviousEndDate,
      },
    });
  });

  test('should return a endDate equal to the current date when no endDate is provided', () => {
    const currentStartDate = DateTime.utc(2024, 1, 1);
    const currentEndDate = undefined;

    const fakeTodayDate = DateTime.utc(2025, 1, 1);

    vi.useFakeTimers();
    vi.setSystemTime(fakeTodayDate.toJSDate());

    const result = getPreviousDates(currentStartDate, currentEndDate);

    vi.useRealTimers();

    const expectedPreviousStartDate = DateTime.utc(2023, 1, 1);
    const expectedPreviousEndDate = currentStartDate;

    expect(result).toEqual({
      current: {
        from: currentStartDate,
        to: fakeTodayDate,
      },
      previous: {
        from: expectedPreviousStartDate,
        to: expectedPreviousEndDate,
      },
    });
  });

  test.each([
    ['a week', [2026, 11, 1], [2026, 11, 8], [2026, 10, 25]],
    ['a calendar quarter', [2026, 7, 1], [2026, 10, 1], [2026, 4, 1]],
    ['a calendar year', [2025, 1, 1], [2026, 1, 1], [2024, 1, 1]],
    ['a span ending on the 30th after a 31st', [2025, 3, 31], [2025, 4, 30], [2025, 2, 28]],
    ['a span from a leap day', [2024, 2, 29], [2024, 3, 31], [2024, 1, 27]],
  ])(
    'should measure the comparison period for %s in calendar months and days',
    (_, start, end, previousStart) => {
      const [startYear, startMonth, startDay] = start as [number, number, number];
      const [endYear, endMonth, endDay] = end as [number, number, number];
      const [previousYear, previousMonth, previousDay] = previousStart as [number, number, number];
      const currentStartDate = DateTime.utc(startYear, startMonth, startDay);

      const result = getPreviousDates(currentStartDate, DateTime.utc(endYear, endMonth, endDay));

      expect(result.previous).toEqual({
        from: DateTime.utc(previousYear, previousMonth, previousDay),
        to: currentStartDate,
      });
    },
  );

  test('should throw a 400 error when startDate is after endDate', () => {
    const currentStartDate = DateTime.utc(2026, 9, 21);
    const currentEndDate = DateTime.utc(2025, 9, 21);

    expect(() => getPreviousDates(currentStartDate, currentEndDate)).toThrow(
      expect.objectContaining({ statusCode: 400 }),
    );
  });
});

describe('calculatePercentageChange', () => {
  test.each([
    [0, 0, 0],
    [0, 1, 100],
    [100, 100, 0],
    [100, 0, undefined],
    [100, 50, 100],
    [50, 100, 50],
  ])('current %i, previous %i, returns %i', (current, previous, expected) => {
    const result = calculatePercentageChange(current, previous);
    if (expected === undefined) {
      expect(result).toBeUndefined();
    } else {
      expect(result).toEqual(expected);
    }
  });
});
