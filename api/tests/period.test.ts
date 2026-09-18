// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, it } from 'vitest';
import {
  calculatePercentageChange,
  getPreviousDates,
  InvalidDateRangeError,
  toPeriodSummary,
} from '../src/lib/period.js';

// Expected ranges were computed with the frontend's Luxon 3.7.2 getPreviousDates
// (frontend/server/data/util.ts), which the API port must match day for day.
const luxonFixtures = [
  {
    label: 'UI 90d preset',
    start: '2025-06-20',
    end: '2025-09-18',
    previousStart: '2025-03-21',
    previousEnd: '2025-06-19',
  },
  {
    label: 'UI 180d preset',
    start: '2025-03-22',
    end: '2025-09-18',
    previousStart: '2024-09-24',
    previousEnd: '2025-03-21',
  },
  {
    label: 'UI 1y preset',
    start: '2024-09-18',
    end: '2025-09-18',
    previousStart: '2023-09-17',
    previousEnd: '2024-09-17',
  },
  {
    label: 'month-end clamp',
    start: '2025-01-31',
    end: '2025-03-01',
    previousStart: '2024-12-29',
    previousEnd: '2025-01-30',
  },
  {
    label: 'leap day start',
    start: '2024-02-29',
    end: '2024-03-31',
    previousStart: '2024-01-26',
    previousEnd: '2024-02-28',
  },
  {
    label: '31st to 30th',
    start: '2025-03-31',
    end: '2025-04-30',
    previousStart: '2025-02-28',
    previousEnd: '2025-03-30',
  },
  {
    label: 'same day',
    start: '2025-09-18',
    end: '2025-09-18',
    previousStart: '2025-09-17',
    previousEnd: '2025-09-17',
  },
  {
    label: 'full month',
    start: '2025-03-01',
    end: '2025-03-31',
    previousStart: '2025-01-29',
    previousEnd: '2025-02-28',
  },
  {
    label: 'full month after leap February',
    start: '2024-03-01',
    end: '2024-03-31',
    previousStart: '2024-01-30',
    previousEnd: '2024-02-29',
  },
  {
    label: 'default start to today',
    start: '2010-01-01',
    end: '2025-09-18',
    previousStart: '1994-04-13',
    previousEnd: '2009-12-31',
  },
] as const;

function thrownBy(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('expected the call to throw');
}

describe('getPreviousDates matches the Nuxt Luxon implementation (AC5)', () => {
  it.each(luxonFixtures)(
    '$label ($start to $end)',
    ({ start, end, previousStart, previousEnd }) => {
      expect(getPreviousDates(start, end)).toEqual({
        current: { startDate: start, endDate: end },
        previous: { startDate: previousStart, endDate: previousEnd },
      });
    },
  );
});

describe('getPreviousDates defaults (AC5)', () => {
  const now = new Date('2025-09-18T15:30:00Z');

  it('uses 2010-01-01 and today in UTC when both dates are omitted', () => {
    expect(getPreviousDates(undefined, undefined, now)).toEqual({
      current: { startDate: '2010-01-01', endDate: '2025-09-18' },
      previous: { startDate: '1994-04-13', endDate: '2009-12-31' },
    });
  });

  it('uses today in UTC when only endDate is omitted', () => {
    expect(getPreviousDates('2025-06-20', undefined, now)).toEqual({
      current: { startDate: '2025-06-20', endDate: '2025-09-18' },
      previous: { startDate: '2025-03-21', endDate: '2025-06-19' },
    });
  });

  it('uses 2010-01-01 when only startDate is omitted', () => {
    expect(getPreviousDates(undefined, '2025-09-18', now).current).toEqual({
      startDate: '2010-01-01',
      endDate: '2025-09-18',
    });
  });

  it('reads today from the clock when now is not passed', () => {
    const before = new Date().toISOString().slice(0, 10);
    const { endDate } = getPreviousDates('2025-06-20').current;
    const after = new Date().toISOString().slice(0, 10);
    expect([before, after]).toContain(endDate);
  });
});

describe('getPreviousDates works in UTC calendar days (AC5)', () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    if (originalTz === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTz;
    }
  });

  it.each(['America/Los_Angeles', 'Pacific/Kiritimati'])(
    'gives the UTC result when the host runs in %s',
    (timeZone) => {
      process.env.TZ = timeZone;
      expect(getPreviousDates('2025-01-31', '2025-03-01')).toEqual({
        current: { startDate: '2025-01-31', endDate: '2025-03-01' },
        previous: { startDate: '2024-12-29', endDate: '2025-01-30' },
      });
      for (const instant of ['2025-09-18T00:30:00Z', '2025-09-18T23:30:00Z']) {
        expect(getPreviousDates(undefined, undefined, new Date(instant)).current.endDate).toBe(
          '2025-09-18',
        );
      }
    },
  );
});

describe('getPreviousDates rejects an inverted range (AC5)', () => {
  it('throws InvalidDateRangeError when startDate is after endDate', () => {
    expect(() => getPreviousDates('2025-09-19', '2025-09-18')).toThrow(InvalidDateRangeError);
  });

  it('marks the error as a 400 invalid_request', () => {
    expect(thrownBy(() => getPreviousDates('2025-09-19', '2025-09-18'))).toMatchObject({
      statusCode: 400,
      code: 'invalid_request',
    });
  });

  it('compares against the defaulted endDate too', () => {
    const now = new Date('2025-09-18T12:00:00Z');
    expect(() => getPreviousDates('2025-09-19', undefined, now)).toThrow(InvalidDateRangeError);
  });
});

describe('calculatePercentageChange (AC6)', () => {
  it.each([
    [150, 100, 50],
    [50, 100, -50],
    [0, 4, -100],
    [0, 0, 0],
    [5, 0, null],
  ])('(%s, %s) is %s', (current, previous, expected) => {
    expect(calculatePercentageChange(current, previous)).toBe(expected);
  });

  it('keeps full precision and the sign', () => {
    expect(calculatePercentageChange(1, 3)).toBeCloseTo(-200 / 3, 10);
  });
});

describe('toPeriodSummary (AC7)', () => {
  const range = { startDate: '2025-06-20', endDate: '2025-09-18' };

  it('builds the six fields from the two counts and the current range', () => {
    expect(toPeriodSummary(150, 100, range)).toEqual({
      current: 150,
      previous: 100,
      percentageChange: 50,
      changeValue: 50,
      periodFrom: '2025-06-20T00:00:00Z',
      periodTo: '2025-09-18T00:00:00Z',
    });
  });

  it('keeps changeValue signed', () => {
    expect(toPeriodSummary(0, 7, range)).toMatchObject({ changeValue: -7, percentageChange: -100 });
  });

  it('sets percentageChange to null when previous is 0', () => {
    expect(toPeriodSummary(5, 0, range)).toMatchObject({ changeValue: 5, percentageChange: null });
  });
});
