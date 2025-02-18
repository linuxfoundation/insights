/**
 * Formats a number with commas and configurable decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string representation of the number
 */

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
    notation: "compact",
    compactDisplay: "short"
  }).format(value);
