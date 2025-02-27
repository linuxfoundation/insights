import {
  describe, test, expect, vi
} from 'vitest';

import {earliestPossibleFromDate, getPreviousDates} from './util';

describe('getPreviousDates', () => {
  test('should return the previous interval start and end dates, for the current start and end dates', () => {
    const currentFromDate = new Date(2025, 0, 10);
    const currentToDate = new Date(2025, 0, 15);

    const result = getPreviousDates(currentFromDate, currentToDate);

    const expectedFromDate = new Date(2025, 0, 4);
    const expectedToDate = new Date(2025, 0, 9);

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
    const currentToDate = new Date(2025, 0, 1);

    const result = getPreviousDates(currentFromDate, currentToDate);

    const expectedCurrentFromDate = earliestPossibleFromDate;

    const expectedPreviousFromDate = new Date(1994, 11, 31);
    const expectedPreviousToDate = new Date(2009, 11, 31);

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
    const currentFromDate = new Date(2024, 0, 1);
    const currentToDate = undefined;

    const fakeTodayDate = new Date(2025, 0, 1);

    vi.useFakeTimers();
    vi.setSystemTime(fakeTodayDate);

    const result = getPreviousDates(currentFromDate, currentToDate);

    vi.useRealTimers();

    const expectedPreviousFromDate = new Date(2022, 11, 30);
    const expectedPreviousToDate = new Date(2023, 11, 31);

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
