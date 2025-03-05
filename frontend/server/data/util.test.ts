import {
  describe, test, expect, vi
} from 'vitest';

import {DateTime} from "luxon";
import {earliestPossibleFromDate, getPreviousDates} from './util';

describe('getPreviousDates', () => {
  test('should return the previous interval start and end dates, for the current start and end dates', () => {
    const currentFromDate = DateTime.utc(2025, 1, 10);
    const currentToDate = DateTime.utc(2025, 1, 15);

    const result = getPreviousDates(currentFromDate, currentToDate);

    const expectedFromDate = DateTime.utc(2025, 1, 4);
    const expectedToDate = DateTime.utc(2025, 1, 9);

    expect(result).toEqual({
      current: {
        from: currentFromDate,
        to: currentToDate
      },
      previous: {
        from: expectedFromDate,
        to: expectedToDate
      }
    });
  });

  test('should return the earliest possible fromDate when no fromDate is provided', () => {
    const currentFromDate = undefined;
    const currentToDate = DateTime.utc(2025, 1, 1);

    const result = getPreviousDates(currentFromDate, currentToDate);

    const expectedCurrentFromDate = earliestPossibleFromDate;

    const expectedPreviousFromDate = DateTime.utc(1994, 12, 31);
    const expectedPreviousToDate = DateTime.utc(2009, 12, 31);

    expect(result).toEqual({
      current: {
        from: expectedCurrentFromDate,
        to: currentToDate
      },
      previous: {
        from: expectedPreviousFromDate,
        to: expectedPreviousToDate
      }
    });
  });

  test('should return a toDate equal to the current date when no toDate is provided', () => {
    const currentFromDate = DateTime.utc(2024, 1, 1);
    const currentToDate = undefined;

    const fakeTodayDate = DateTime.utc(2025, 1, 1);

    vi.useFakeTimers();
    vi.setSystemTime(fakeTodayDate.toJSDate());

    const result = getPreviousDates(currentFromDate, currentToDate);

    vi.useRealTimers();

    const expectedPreviousFromDate = DateTime.utc(2022, 12, 31);
    const expectedPreviousToDate = DateTime.utc(2023, 12, 31);

    expect(result).toEqual({
      current: {
        from: currentFromDate,
        to: fakeTodayDate
      },
      previous: {
        from: expectedPreviousFromDate,
        to: expectedPreviousToDate
      }
    });
  });
});
