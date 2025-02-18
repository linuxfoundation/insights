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
