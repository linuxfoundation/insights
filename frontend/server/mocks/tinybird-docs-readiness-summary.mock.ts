// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { TinybirdDocsReadinessSummary } from '~~/server/data/tinybird/docs-readiness/summary';

const response = (data: TinybirdDocsReadinessSummary[]) => ({
  meta: [],
  data,
  rows: data.length,
  statistics: { elapsed: 0.085, rows_read: 170000, bytes_read: 1024 },
});

export const row = (
  overrides: Partial<TinybirdDocsReadinessSummary>,
): TinybirdDocsReadinessSummary => ({
  projectId: 'project-id',
  state: 'scored',
  lastRunDate: '2026-11-01',
  lastRunOk: 1,
  resultRunDate: '2026-11-01',
  docsUrl: '',
  discoveryMethod: '',
  confidence: '',
  isOverride: 0,
  overallScore: null,
  categoryScores: '',
  repoUrl: '',
  lfMedian: 50,
  ...overrides,
});

const OTEL_SCORES =
  '{"authentication":100,"content-discoverability":86,"content-structure":100,"markdown-availability":100,"observability":33,"page-size":50,"url-stability":50}';

export const scoredRow = row({
  state: 'scored',
  docsUrl: 'https://opentelemetry.io/docs',
  discoveryMethod: 'docs-path',
  confidence: 'medium',
  overallScore: 77,
  categoryScores: OTEL_SCORES,
});

export const mockSummaryScored = response([scoredRow]);

export const mockSummaryScoredOverride = response([
  row({
    state: 'scored',
    docsUrl: 'https://www.finos.org/os-climate',
    discoveryMethod: 'override',
    confidence: 'authoritative',
    isOverride: 1,
    overallScore: 40,
    categoryScores:
      '{"authentication":100,"content-discoverability":0,"content-structure":100,"markdown-availability":0,"observability":0,"page-size":67,"url-stability":100}',
  }),
]);

export const mockSummaryConfirmedNoDocs = response([
  row({
    state: 'confirmed-no-docs',
    lastRunOk: 0,
    discoveryMethod: 'override',
    confidence: 'authoritative',
    isOverride: 1,
    repoUrl: '',
  }),
]);

export const mockSummaryNoDocs = response([row({ state: 'no-docs', lastRunOk: 0 })]);

export const mockSummaryRepoOnly = response([
  row({
    state: 'repo-only',
    lastRunOk: 0,
    docsUrl: 'https://github.com/openmainframeproject/ade',
    discoveryMethod: 'repo-url',
    confidence: 'low',
    repoUrl: 'https://github.com/openmainframeproject/ade',
  }),
]);

export const mockSummaryFailed = response([
  row({
    state: 'failed',
    lastRunDate: '2026-11-20',
    lastRunOk: 0,
    resultRunDate: '2026-11-20',
    docsUrl: 'https://cdk8s.io/docs',
    discoveryMethod: 'docs-path',
    confidence: 'medium',
  }),
]);

export const mockSummaryLatestFailed = response([
  row({
    state: 'latest-failed',
    lastRunDate: '2026-09-30',
    lastRunOk: 0,
    resultRunDate: '2026-09-29',
    docsUrl: 'https://opentelemetry.io/docs',
    discoveryMethod: 'docs-path',
    confidence: 'medium',
    overallScore: 70,
    categoryScores:
      '{"authentication":100,"content-discoverability":86,"content-structure":100,"markdown-availability":100,"observability":0,"page-size":25,"url-stability":50}',
  }),
]);

export const mockSummaryNotEvaluated = response([
  row({ state: 'not-evaluated', lastRunDate: null, lastRunOk: 0, resultRunDate: null }),
]);

export const mockSummaryEmpty = response([]);
