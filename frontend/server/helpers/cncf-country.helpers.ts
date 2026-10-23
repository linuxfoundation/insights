// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';

import type { CncfCountryFilter } from '~~/server/data/tinybird/report/cncf-country';

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

/**
 * Reads the country and period shared by every CNCF country report route, rejecting a
 * country code that is not ISO 3166-1 alpha-2.
 */
export function parseCncfCountryFilter(query: Record<string, unknown>): CncfCountryFilter {
  const countryCode = String(query.countryCode ?? '').toUpperCase();

  if (!COUNTRY_CODE_PATTERN.test(countryCode)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid countryCode: ${query.countryCode}`,
    });
  }

  return {
    countryCode,
    startDate: parseDate(query.startDate, 'startDate'),
    endDate: parseDate(query.endDate, 'endDate'),
  };
}

function parseDate(value: unknown, field: string): DateTime | undefined {
  if (value === undefined || value === '') return undefined;

  const date = typeof value === 'string' ? DateTime.fromISO(value) : undefined;
  if (!date?.isValid) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${field}: ${value}` });
  }
  return date;
}

export function parseLimit(value: unknown, fallback: number, max = 50): number {
  const limit = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(limit) || limit < 1) return fallback;
  return Math.min(limit, max);
}
