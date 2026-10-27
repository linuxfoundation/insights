// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';

import { EUROPEAN_COUNTRY_CODES } from '~~/app/components/modules/report/cncf/config/european-countries';
import type { CncfCountryFilter } from '~~/server/data/tinybird/report/cncf-country';

// Countries with a report page; add a code here when a new country page ships.
const SUPPORTED_COUNTRY_CODES = new Set(['FR']);

// Region each country is compared with; Europe matches the CNCF geographic report's grouping.
const COMPARISON_REGIONS: Record<string, { name: string; codes: string[] }> = {
  FR: { name: 'Europe', codes: [...EUROPEAN_COUNTRY_CODES] },
};

export function getComparisonRegion(countryCode: string): { name: string; codes: string[] } {
  const region = COMPARISON_REGIONS[countryCode];
  if (!region) {
    throw createError({
      statusCode: 400,
      statusMessage: `No comparison region for ${countryCode}`,
    });
  }
  return region;
}

/**
 * Reads the country and period shared by every CNCF country report route, rejecting a
 * country that has no report.
 */
export function parseCncfCountryFilter(query: Record<string, unknown>): CncfCountryFilter {
  const countryCode = String(query.countryCode ?? '').toUpperCase();

  if (!SUPPORTED_COUNTRY_CODES.has(countryCode)) {
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
