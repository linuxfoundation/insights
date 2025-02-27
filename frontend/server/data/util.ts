import { differenceInDays, subDays } from "date-fns";

// TODO: What should this date be?
export const earliestPossibleFromDate = new Date(2010, 0, 1);

/**
 * Calculates the start and end dates for the previous time interval, based on the current start and end dates.
 * Needs to calculate the number of days between the current start and end dates,
 * and then subtract that from the current dates to get the previous ones.
 * It provides correct defaults for the current dates if they are not provided.
 */
export function getPreviousDates(currentFromDate?: Date, currentToDate?: Date) {
  const safeFromDate = currentFromDate || earliestPossibleFromDate;
  const safeToDate = currentToDate || new Date();

  // Ensure the from date is before the to date
  if (safeFromDate > safeToDate) {
    throw new Error('From date must be before or equal to the to date');
  }

  const diffDays = differenceInDays(safeToDate, safeFromDate);

  const previousToDate = subDays(safeFromDate, 1);
  const previousFromDate = subDays(previousToDate, diffDays);

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
