// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/**
 * Formats a number with commas and configurable decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string representation of the number
 */

import { Duration } from 'luxon';
import pluralize from 'pluralize';
import { FormatterUnits } from '~/components/shared/types/formatter.types';

type ShowUnits = 'short' | 'long' | 'no';
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

const shiftToUnit = (value: number, unit: FormatterUnits): number => {
  // convert the value which is in seconds to the unit
  const valueInSeconds = Duration.fromObject({ seconds: value });
  return valueInSeconds.shiftTo(unit).get(unit);
};

const roundNumber = (value: number, roundTo?: number): number => {
  if (roundTo && roundTo > 0) {
    return Number(value.toFixed(roundTo));
  }
  return value < 1 ? Number(value.toFixed(roundTo || 1)) : Math.round(value);
};

const getUnit = (unit: FormatterUnits, showUnits: ShowUnits, value: number): string => {
  if (showUnits === 'no') {
    return '';
  }
  switch (unit) {
    case FormatterUnits.YEARS:
      return showUnits === 'short' ? 'y' : ` ${pluralize('year', value)}`;
    case FormatterUnits.MONTHS:
      return showUnits === 'short' ? 'mo' : ` ${pluralize('month', value)}`;
    case FormatterUnits.DAYS:
      return showUnits === 'short' ? 'd' : ` ${pluralize('day', value)}`;
    case FormatterUnits.HOURS:
      return showUnits === 'short' ? 'h' : ` ${pluralize('hour', value)}`;
    case FormatterUnits.MINUTES:
      return showUnits === 'short' ? 'm' : ` ${pluralize('minute', value)}`;
    case FormatterUnits.SECONDS:
      return showUnits === 'short' ? 's' : ` ${pluralize('second', value)}`;
    default:
      return '';
  }
};

const convertToUnit = (
  value: number,
  unit: FormatterUnits,
  showUnits: ShowUnits,
  roundTo?: number
): string => {
  const shiftedValue = shiftToUnit(value, unit);
  const roundedValue = roundNumber(shiftedValue, roundTo);

  return `${roundedValue}${getUnit(unit, showUnits, roundedValue)}`;
};

/**
 * Formats a number to a duration, if toUnit is provided, it will convert the number to the given unit
 * @param value - The number to format
 * @param showUnits - The unit to show
 * @param toUnit - The unit to convert to
 * @returns Formatted string representation of the number
 */
export const formatSecondsToDuration = (
  value: number,
  showUnits: ShowUnits = 'short',
  toUnit?: FormatterUnits,
  roundTo?: number
): string => {
  // Convert to various units
  const duration = Duration.fromObject({ seconds: value }).rescale().toObject();

  const {
 years, months, weeks, days, hours, minutes
} = duration;

  // Handle each case from largest to smallest unit
  if (toUnit) {
    return convertToUnit(value, toUnit, showUnits, roundTo);
  }

  if (years && years >= 1) {
    return convertToUnit(value, FormatterUnits.YEARS, showUnits, roundTo);
  }
  if (months && months >= 1) {
    return convertToUnit(value, FormatterUnits.MONTHS, showUnits, roundTo);
  }
  if ((weeks && weeks >= 1) || (days && days >= 1)) {
    return convertToUnit(value, FormatterUnits.DAYS, showUnits, roundTo);
  }
  if (hours && hours >= 1) {
    return convertToUnit(value, FormatterUnits.HOURS, showUnits, roundTo);
  }
  if (minutes && minutes >= 1) {
    return convertToUnit(value, FormatterUnits.MINUTES, showUnits, roundTo);
  }

  // Only show decimal for seconds
  return convertToUnit(value, FormatterUnits.SECONDS, showUnits, roundTo);
};
