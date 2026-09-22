// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { NullablePeriodSummary, PeriodSummary } from '../schemas/common.js';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export class InvalidDateRangeError extends Error {
  readonly statusCode = 400;
  readonly code = 'invalid_request';

  constructor(message: string) {
    super(message);
    this.name = 'InvalidDateRangeError';
  }
}

// Same default as earliestPossibleStartDate in frontend/server/data/util.ts.
const earliestStartDate = '2010-01-01';
const dayMs = 86_400_000;

// Dates are UTC midnights read with UTC getters, so the host time zone never shifts a calendar day.
export const utcMidnight = (day: string) => `${day}T00:00:00Z`;
const parseDay = (day: string) => new Date(utcMidnight(day));
const formatDay = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * dayMs);

// Tinybird returns Date columns as YYYY-MM-DD and DateTime columns as YYYY-MM-DD HH:mm:ss, both
// UTC. Both land in the T..Z shape toPeriodSummary writes, so every date in a body has one format.
export function toIsoUtc(value: string): string {
  const [day, time] = value.split(' ');
  return time ? `${day}T${time}Z` : utcMidnight(day);
}

// Some pipes declare bucket bounds Nullable(Date). A row without both has no place on the time
// axis; whether a route drops it or answers 503 is the route's call.
export const hasBucketBounds = <T extends { startDate: string | null; endDate: string | null }>(
  row: T,
): row is T & DateRange => typeof row.startDate === 'string' && typeof row.endDate === 'string';

// The pipes take DateTime parameters where the Nuxt data layer sends Luxon's 'yyyy-MM-dd 00:00:00'.
export function toTinybirdRange(range: Partial<DateRange>): Partial<DateRange> {
  const day = (value?: string) => (value === undefined ? undefined : `${value} 00:00:00`);
  return { startDate: day(range.startDate), endDate: day(range.endDate) };
}

// Date.UTC remaps years 0 to 99 onto 1900 to 1999; setUTCFullYear keeps the year as given.
function utcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  return date;
}

function addMonthsClamped(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = utcDate(year, month + 1, 0).getUTCDate();
  return utcDate(year, month, Math.min(date.getUTCDate(), lastDay));
}

// Ports Luxon's end.diff(start, ['months', 'days']) and minus() from frontend/server/data/util.ts,
// month-end clamping included, so previous periods match the UI's day for day.
export function getPreviousDates(
  startDate = earliestStartDate,
  endDate?: string,
  now = new Date(),
): { current: DateRange; previous: DateRange } {
  const current = { startDate, endDate: endDate ?? formatDay(now) };
  const start = parseDay(current.startDate);
  const end = parseDay(current.endDate);
  if (start > end) {
    throw new InvalidDateRangeError('startDate must be on or before endDate');
  }

  let months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth();
  let monthsEnd = addMonthsClamped(start, months);
  if (monthsEnd > end) {
    months -= 1;
    monthsEnd = addMonthsClamped(start, months);
  }
  const days = (end.getTime() - monthsEnd.getTime()) / dayMs;

  const previousEnd = addDays(start, -1);
  const previousStart = addDays(addMonthsClamped(previousEnd, -months), -days);
  // toISOString writes years below 0 as a signed six-digit year, which is not a YYYY-MM-DD day.
  if (previousStart.getUTCFullYear() < 0) {
    throw new InvalidDateRangeError('startDate is too early to compute a previous period');
  }
  return {
    current,
    previous: { startDate: formatDay(previousStart), endDate: formatDay(previousEnd) },
  };
}

// Signed, unlike Nuxt's Math.abs, so a drop reads negative just like changeValue.
export function calculatePercentageChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / previous) * 100;
}

export function toPeriodSummary(
  current: number,
  previous: number,
  range: DateRange,
): PeriodSummary {
  return {
    current,
    previous,
    percentageChange: calculatePercentageChange(current, previous),
    changeValue: current - previous,
    periodFrom: utcMidnight(range.startDate),
    periodTo: utcMidnight(range.endDate),
  };
}

export function toNullablePeriodSummary(
  current: number | null,
  previous: number | null,
  range: DateRange,
): NullablePeriodSummary {
  if (current === null || previous === null) {
    return {
      current,
      previous,
      percentageChange: null,
      changeValue: null,
      periodFrom: utcMidnight(range.startDate),
      periodTo: utcMidnight(range.endDate),
    };
  }
  return toPeriodSummary(current, previous, range);
}
