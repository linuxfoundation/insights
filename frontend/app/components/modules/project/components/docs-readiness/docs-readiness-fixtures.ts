// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {
  DocsReadinessChecks,
  DocsReadinessHistory,
  DocsReadinessSummary,
} from '~~/types/docs-readiness/readiness.types';

export const summaryFixture = (
  overrides: Partial<DocsReadinessSummary> = {},
): DocsReadinessSummary => ({
  state: 'scored',
  score: 45,
  median: { value: 50, delta: 5, direction: 'below' },
  docsUrl: 'https://docs.kubernetes.io/',
  repoUrl: 'https://github.com/kubernetes/kubernetes',
  isOverride: false,
  discovery: { method: 'docs-subdomain', label: 'Found at a docs subdomain' },
  confidence: {
    level: 'high',
    label: 'High confidence',
    tooltip: 'Found at a conventional docs location',
  },
  lastEvaluated: { date: '2026-11-01', failed: false },
  resultDate: '2026-11-01',
  nextEvaluation: { at: '2026-12-01T02:00:00.000Z', retryingDaily: false },
  biggestGap: null,
  ...overrides,
});

export const historyFixture = (): DocsReadinessHistory => ({
  firstEvaluatedMonth: '2026-09-01',
  months: [
    {
      month: '2026-09-01',
      score: 45,
      failed: false,
      docsUrl: 'https://docs.kubernetes.io/',
      urlChanged: false,
    },
    {
      month: '2026-10-01',
      score: 45,
      failed: false,
      docsUrl: 'https://docs.kubernetes.io/',
      urlChanged: false,
    },
    {
      month: '2026-11-01',
      score: 45,
      failed: false,
      docsUrl: 'https://docs.kubernetes.io/',
      urlChanged: false,
    },
  ],
});

export const checksFixture = (
  overrides: Partial<DocsReadinessChecks> = {},
): DocsReadinessChecks => ({
  pagesTested: 1,
  counts: { passed: 7, needsAttention: 2, failed: 5, skipped: 9 },
  categories: [
    {
      key: 'content-discoverability',
      name: 'Content discoverability',
      description: '',
      weight: 30,
      percent: 50,
      points: 15,
      notAssessed: false,
      passed: 1,
      applicable: 2,
      needsAttention: 1,
      checks: [],
    },
  ],
  ...overrides,
});
