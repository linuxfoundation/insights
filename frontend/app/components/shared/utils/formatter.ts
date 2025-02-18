/**
 * Formats a number with commas and configurable decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @param forceDecimals - Whether to show decimal places even for whole numbers (default: false)
 * @returns Formatted string representation of the number
 */
export const formatNumber = (value: number, decimals = 0, forceDecimals = false): string => {
  if (Number.isNaN(value)) return '0';

  const hasDecimals = value % 1 !== 0;

  // Only show decimals if number has decimals or if forced
  const fixedNum = hasDecimals || forceDecimals ? value.toFixed(decimals) : Math.floor(value).toString();

  // Add commas for thousands
  return fixedNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Formats a number with short notation (e.g. 1.5M)
 * @param value - The number to format
 * @returns Formatted string representation of the number
 */
export const formatNumberShort = (value: number): string => new Intl.NumberFormat('en', {
    notation: "compact",
    compactDisplay: "short"
  }).format(value);
