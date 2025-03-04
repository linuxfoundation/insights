/**
 * Formats a number with commas and configurable decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string representation of the number
 */

import { Duration } from 'luxon';

export const formatNumber = (value: number, decimals = 0): string => Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: decimals
  }).format(value);

/**
 * Formats a number with short notation (e.g. 1.5M)
 * @param value - The number to format
 * @returns Formatted string representation of the number
 */
export const formatNumberShort = (value: number): string => new Intl.NumberFormat('en', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value);

/**
 * Formats a number using Luxon Duration to duration in hours and minutes
 * @param value - The number to format in minutes
 * @returns Formatted string representation of the number
 */
export const formatNumberToDuration = (value: number): string => {
  const duration = Duration.fromObject({ minutes: value });
  return value > 60 ? duration.toFormat("hh'h' mm'm'") : duration.toFormat("mm'm'");
};
