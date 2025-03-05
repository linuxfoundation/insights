import {DateTime} from "luxon";

// This sets how far back we want to go when no start date is provided.
// TODO: What should we set this to? Is this even how we want to address this problem?
export const earliestPossibleFromDate = DateTime.utc(2010, 1, 1);

/**
 * Calculates the start and end dates for the previous time interval, based on the current start and end dates.
 * Needs to calculate the number of days between the current start and end dates,
 * and then subtract that from the current dates to get the previous ones.
 * It provides correct defaults for the current dates if they are not provided.
 */
export function getPreviousDates(currentFromDate?: DateTime, currentToDate?: DateTime) {
  const safeFromDate = currentFromDate || earliestPossibleFromDate;
  const safeToDate = currentToDate || DateTime.utc();

  if (safeFromDate > safeToDate) {
    throw new Error('From date must be before or equal to the to date');
  }

  const dateDiff = safeToDate.diff(safeFromDate, ['months', 'days']);

  // const previousToDate = subDays(safeFromDate, 1);
  const previousToDate = safeFromDate.minus({days: 1});
  // const previousFromDate = subDays(previousToDate, dateDiff);
  const previousFromDate = previousToDate.minus(dateDiff);

  return {
    current: {
      from: safeFromDate,
      to: safeToDate
    },
    previous: {
      from: previousFromDate,
      to: previousToDate
    }
  };
}
