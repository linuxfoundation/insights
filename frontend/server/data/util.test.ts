// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  describe, test, expect, vi
} from 'vitest';

import {DateTime} from "luxon";
import {calculatePercentageChange, earliestPossibleStartDate, getPreviousDates} from './util';

describe('getPreviousDates', () => {
  test('should return the previous interval start and end dates, for the current start and end dates', () => {
    const currentStartDate = DateTime.utc(2025, 1, 10);
    const currentEndDate = DateTime.utc(2025, 1, 15);

    const result = getPreviousDates(currentStartDate, currentEndDate);

    const expectedStartDate = DateTime.utc(2025, 1, 4);
    const expectedEndDate = DateTime.utc(2025, 1, 9);

    expect(result).toEqual({
      current: {
        from: currentStartDate,
        to: currentEndDate
      },
      previous: {
        from: expectedStartDate,
        to: expectedEndDate
      }
    });
  });

  test('should return the earliest possible startDate when no startDate is provided', () => {
    const currentStartDate = undefined;
    const currentEndDate = DateTime.utc(2025, 1, 1);

    const result = getPreviousDates(currentStartDate, currentEndDate);

    const expectedCurrentStartDate = earliestPossibleStartDate;

    const expectedPreviousStartDate = DateTime.utc(1994, 12, 31);
    const expectedPreviousEndDate = DateTime.utc(2009, 12, 31);

    expect(result).toEqual({
      current: {
        from: expectedCurrentStartDate,
        to: currentEndDate
      },
      previous: {
        from: expectedPreviousStartDate,
        to: expectedPreviousEndDate
      }
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

    const expectedPreviousStartDate = DateTime.utc(2022, 12, 31);
    const expectedPreviousEndDate = DateTime.utc(2023, 12, 31);

    expect(result).toEqual({
      current: {
        from: currentStartDate,
        to: fakeTodayDate
      },
      previous: {
        from: expectedPreviousStartDate,
        to: expectedPreviousEndDate
      }
    });
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
  ])("current %i, previous %i, returns %i", (current, previous, expected) => {
    const result = calculatePercentageChange(current, previous);
    if (expected === undefined) {
      expect(result).toBeUndefined();
    } else {
      expect(result).toEqual(expected);
    }
  });
});
