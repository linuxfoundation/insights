import {DateTime} from "luxon";

// This sets how far back we want to go when no start date is provided.
// TODO: What should we set this to? Is this even how we want to address this problem?
export const earliestPossibleStartDate = DateTime.utc(2010, 1, 1);

/**
 * Calculates the start and end dates for the previous time interval, based on the current start and end dates.
 * Needs to calculate the number of days between the current start and end dates,
 * and then subtract that from the current dates to get the previous ones.
 * It provides correct defaults for the current dates if they are not provided.
 */
export function getPreviousDates(currentStartDate?: DateTime, currentEndDate?: DateTime) {
  const safeStartDate = currentStartDate || earliestPossibleStartDate;
  const safeEndDate = currentEndDate || DateTime.utc();

  if (safeStartDate > safeEndDate) {
    throw new Error('From date must be before or equal to the to date');
  }

  const dateDiff = safeEndDate.diff(safeStartDate, ['months', 'days']);

  const previousEndDate = safeStartDate.minus({days: 1});
  const previousStartDate = previousEndDate.minus(dateDiff);

  return {
    current: {
      from: safeStartDate,
      to: safeEndDate
    },
    previous: {
      from: previousStartDate,
      to: previousEndDate
    }
  };
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous !== 0) {
    return ((current * 100) / previous) - 100;
  }

  return 0;
}
