// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { fetchFromTinybird } from '../tinybird';
import type {
  HealthScoreCoverageGlanceRow,
  HealthScoreCoverageGlanceData,
} from '~~/types/report/health-score-coverage.types';

export async function fetchHealthScoreCoverageGlance(): Promise<HealthScoreCoverageGlanceData> {
  const result = await fetchFromTinybird<HealthScoreCoverageGlanceRow[]>(
    '/v0/pipes/health_score_report_kpis.json',
    {},
  );

  const row = result.data[0];
  if (!row) {
    throw new Error('No data returned from health_score_report_kpis');
  }

  // Tinybird returns a SQL-style datetime ("yyyy-MM-dd HH:mm:ss"), not ISO -
  // normalize to ISO so the frontend can format it with the shared formatDate util.
  const updatedAt = DateTime.fromSQL(row.updated_at, { zone: 'utc' }).toISO() ?? row.updated_at;

  return {
    reposTracked: row.repos_tracked,
    reposScored: row.repos_scored,
    projectsTracked: row.projects_tracked,
    projectsScored: row.projects_scored,
    projectsPartial: row.projects_partial,
    updatedAt,
  };
}
