// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone data-fetcher for the "Health score bands" widget (IN-1286). Kept out of the shared
// server/data/tinybird/report/health-score-coverage.ts file for the same merge-order reason as
// the types file next to it - see health-score-coverage-bands.types.ts.

import { fetchFromTinybird } from '../tinybird';
import type {
  HealthScoreCoverageBandCount,
  HealthScoreCoverageBandsData,
  HealthScoreCoverageBandsRow,
  HealthScoreCoverageScope,
} from '~~/types/report/health-score-coverage-bands.types';

// Fixed display order per the design: Excellent, Healthy, Fair, Concerning, Critical.
const BAND_ORDER = ['excellent', 'healthy', 'fair', 'concerning', 'critical'] as const;

const COVERED_FULL = 3;
const COVERED_PARTIAL = 2;

/**
 * Maps the raw `health_score_report_bands` rows into the fixed 5-band shape the chart consumes,
 * filling in any band/coverage pair the pipe didn't return with 0.
 */
export function mapHealthScoreCoverageBandsRows(
  rows: HealthScoreCoverageBandsRow[],
): HealthScoreCoverageBandsData {
  const counts = new Map<string, { full: number; partial: number }>(
    BAND_ORDER.map((band) => [band, { full: 0, partial: 0 }]),
  );

  rows.forEach((row) => {
    const entry = counts.get(row.band);
    if (!entry) return;
    if (row.covered === COVERED_FULL) entry.full += row.projects;
    else if (row.covered === COVERED_PARTIAL) entry.partial += row.projects;
  });

  const bands: HealthScoreCoverageBandCount[] = BAND_ORDER.map((band) => ({
    band,
    full: counts.get(band)?.full ?? 0,
    partial: counts.get(band)?.partial ?? 0,
  }));

  return {
    bands,
    fullTotal: bands.reduce((sum, band) => sum + band.full, 0),
    partialTotal: bands.reduce((sum, band) => sum + band.partial, 0),
  };
}

export async function fetchHealthScoreCoverageBands(
  scope: HealthScoreCoverageScope = 'all',
): Promise<HealthScoreCoverageBandsData> {
  const result = await fetchFromTinybird<HealthScoreCoverageBandsRow[]>(
    '/v0/pipes/health_score_report_bands.json',
    { scope },
  );

  return mapHealthScoreCoverageBandsRows(result.data);
}
