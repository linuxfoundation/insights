// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone data-fetcher for the "Security coverage on GitHub-hosted repositories" widget
// (IN-1293). Kept out of the shared server/data/tinybird/report/health-score-coverage.ts file for
// the same merge-order reason as the types file next to it - see
// health-score-coverage-github-security.types.ts.

import { fetchFromTinybird } from '../tinybird';
import type {
  HealthScoreCoverageGithubSecurityData,
  HealthScoreCoverageGithubSecurityRow,
  HealthScoreCoverageGithubSecurityStageCount,
  HealthScoreCoverageGithubSecurityStageKey,
} from '~~/types/report/health-score-coverage-github-security.types';

const EMPTY_ROW: HealthScoreCoverageGithubSecurityRow = {
  isLF: 0,
  tracked: 0,
  health_published: 0,
  security_scored: 0,
  scorecard_scanned: 0,
  lf_non_github: 0,
};

// Fixed funnel order per the pipe's DESCRIPTION (monotonically decreasing):
// tracked >= healthPublished >= securityScored >= scorecardScanned.
const STAGE_ORDER: {
  stage: HealthScoreCoverageGithubSecurityStageKey;
  label: string;
  key: keyof Pick<
    HealthScoreCoverageGithubSecurityRow,
    'tracked' | 'health_published' | 'security_scored' | 'scorecard_scanned'
  >;
}[] = [
  { stage: 'tracked', label: 'Tracked in Insights', key: 'tracked' },
  { stage: 'healthPublished', label: 'Health score published', key: 'health_published' },
  { stage: 'securityScored', label: 'Security category scored', key: 'security_scored' },
  { stage: 'scorecardScanned', label: 'Scanned by Scorecard', key: 'scorecard_scanned' },
];

const round1 = (value: number): number => Math.round(value * 10) / 10;

const sharePct = (count: number, tracked: number): number =>
  tracked === 0 ? 0 : round1((count / tracked) * 100);

/**
 * Maps the raw `health_score_report_github_security` rows (one per `isLF`) into the fixed
 * 4-stage funnel shape the table consumes, plus the `lf_non_github` footnote count.
 */
export function mapHealthScoreCoverageGithubSecurityRows(
  rows: HealthScoreCoverageGithubSecurityRow[],
): HealthScoreCoverageGithubSecurityData {
  const lfRow = rows.find((row) => row.isLF === 1) ?? EMPTY_ROW;
  const otherRow = rows.find((row) => row.isLF === 0) ?? EMPTY_ROW;

  const stages: HealthScoreCoverageGithubSecurityStageCount[] = STAGE_ORDER.map(
    ({ stage, label, key }) => ({
      stage,
      label,
      lf: lfRow[key],
      lfSharePct: sharePct(lfRow[key], lfRow.tracked),
      other: otherRow[key],
      otherSharePct: sharePct(otherRow[key], otherRow.tracked),
    }),
  );

  return {
    stages,
    lfNonGithub: lfRow.lf_non_github || otherRow.lf_non_github,
  };
}

export async function fetchHealthScoreCoverageGithubSecurity(): Promise<HealthScoreCoverageGithubSecurityData> {
  const result = await fetchFromTinybird<HealthScoreCoverageGithubSecurityRow[]>(
    '/v0/pipes/health_score_report_github_security.json',
    {},
  );

  return mapHealthScoreCoverageGithubSecurityRows(result.data);
}
