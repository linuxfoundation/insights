import { DateTime } from 'luxon';

export interface DateRange {
  fromDate: string;
  toDate: string;
}

/**
 * This functions takes the from and to date and returns the previous range
 * For example:
 * - fromDate: 2022-01-01, toDate: 2022-01-31
 * - returns: fromDate: 2021-12-01, toDate: 2021-12-31
 * @param fromDate ISO date string for start date
 * @param toDate ISO date string for end date
 * @returns {Object} Previous date range with fromDate and toDate as ISO strings
 */
export function getPreviousDateRange(fromDate: string, toDate: string) {
  const start = DateTime.fromISO(fromDate);
  const end = DateTime.fromISO(toDate);
  const duration = end.diff(start);

  const previousEnd = start.minus({ milliseconds: 1 });
  const previousStart = previousEnd.minus(duration);

  return {
    fromDate: previousStart.toFormat('yyyy-MM-dd'),
    toDate: previousEnd.toFormat('yyyy-MM-dd')
  };
}

export function addTimeToDate(date: string) {
  return `${date} 00:00:00`;
}
