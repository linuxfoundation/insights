/* eslint-disable */

export const isEmpty = (value: Record<string, unknown>[] | null | undefined) =>
  // check if the value is null or undefined or the length of the value is 0
  value === null || value === undefined || value.length === 0;
