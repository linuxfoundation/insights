// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export type DocsReadinessState =
  | 'not-evaluated'
  | 'scored'
  | 'confirmed-no-docs'
  | 'no-docs'
  | 'repo-only'
  | 'latest-failed'
  | 'failed';

export type DocsReadinessCheckStatus = 'fail' | 'error' | 'warn' | 'pass' | 'skip';
export type DocsReadinessSkipReason = 'needs-llms-txt' | 'needs-markdown';

export interface DocsReadinessBiggestGap {
  key: string;
  name: string;
  earned: number;
  weight: number;
}

export interface DocsReadinessSummary {
  state: DocsReadinessState;
  score: number | null;
  // delta is absolute; value can end in .5 when the LF count is even
  median: { value: number; delta: number; direction: 'below' | 'above' | 'equal' } | null;
  docsUrl: string | null;
  repoUrl: string | null;
  isOverride: boolean;
  discovery: { method: string; label: string } | null;
  confidence: { level: string; label: string; tooltip: string } | null;
  lastEvaluated: { date: string; failed: boolean } | null;
  // run date of the shown score; differs from lastEvaluated.date only for latest-failed
  resultDate: string | null;
  nextEvaluation: { at: string | null; retryingDaily: boolean } | null;
  biggestGap: DocsReadinessBiggestGap | null;
}

export interface DocsReadinessHistoryMonth {
  month: string;
  score: number | null;
  failed: boolean;
  docsUrl: string;
  urlChanged: boolean;
}

export interface DocsReadinessHistory {
  firstEvaluatedMonth: string | null;
  months: DocsReadinessHistoryMonth[];
}

export interface DocsReadinessCheck {
  id: string;
  status: DocsReadinessCheckStatus;
  message: string;
  skipReason: DocsReadinessSkipReason | null;
  testedPages: number | null;
  totalPages: number | null;
}

export interface DocsReadinessCategory {
  key: string;
  name: string;
  description: string;
  weight: number | null;
  percent: number | null;
  points: number | null;
  notAssessed: boolean;
  passed: number;
  applicable: number;
  needsAttention: number;
  checks: DocsReadinessCheck[];
}

export interface DocsReadinessChecks {
  pagesTested: number | null;
  counts: { passed: number; needsAttention: number; failed: number; skipped: number };
  categories: DocsReadinessCategory[];
}
