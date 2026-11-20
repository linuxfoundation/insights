// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { DateTime } from 'luxon';

import {
  DOCS_READINESS_CONFIDENCE_LABELS,
  DOCS_READINESS_METHOD_LABELS,
} from '~~/config/docs-readiness';
import type {
  DocsReadinessState,
  DocsReadinessSummary,
} from '~~/types/docs-readiness/readiness.types';

import { fetchFromTinybird } from '../tinybird';
import { findBiggestGap, parseCategoryScores } from './categories';

export type TinybirdDocsReadinessSummary = {
  projectId: string;
  state: string;
  lastRunDate: string | null;
  lastRunOk: number;
  resultRunDate: string | null;
  docsUrl: string;
  discoveryMethod: string;
  confidence: string;
  isOverride: number;
  overallScore: number | null;
  categoryScores: string;
  repoUrl: string;
  lfMedian: number | null;
};

// Full sweep cron is `0 2 1 * *` in the docs readiness worker
export function getNextEvaluationAt(now: DateTime): string {
  const thisMonth = now.toUTC().startOf('month').plus({ hours: 2 });
  return (now < thisMonth ? thisMonth : thisMonth.plus({ months: 1 })).toISO()!;
}

export function mapSummary(row: TinybirdDocsReadinessSummary, now: DateTime): DocsReadinessSummary {
  const state = row.state as DocsReadinessState;
  const failedState = state === 'latest-failed' || state === 'failed';
  const score = row.overallScore;
  const docsUrl = state === 'repo-only' || !row.docsUrl ? null : row.docsUrl;
  const scores = score === null ? null : parseCategoryScores(row.categoryScores);
  const confidence = DOCS_READINESS_CONFIDENCE_LABELS[row.confidence];

  let nextEvaluation: DocsReadinessSummary['nextEvaluation'] = null;
  if (failedState) nextEvaluation = { at: null, retryingDaily: true };
  else if (state !== 'not-evaluated') {
    nextEvaluation = { at: getNextEvaluationAt(now), retryingDaily: false };
  }

  let median: DocsReadinessSummary['median'] = null;
  if (score !== null && row.lfMedian !== null) {
    const diff = score - row.lfMedian;
    median = {
      value: row.lfMedian,
      delta: Math.abs(diff),
      direction: diff === 0 ? 'equal' : diff < 0 ? 'below' : 'above',
    };
  }

  return {
    state,
    score,
    median,
    docsUrl,
    repoUrl: row.repoUrl || null,
    isOverride: row.isOverride === 1,
    discovery:
      docsUrl && row.discoveryMethod
        ? {
            method: row.discoveryMethod,
            label: DOCS_READINESS_METHOD_LABELS[row.discoveryMethod] ?? row.discoveryMethod,
          }
        : null,
    confidence:
      docsUrl && row.confidence
        ? {
            level: row.confidence,
            label: confidence?.label ?? row.confidence,
            tooltip: confidence?.tooltip ?? '',
          }
        : null,
    lastEvaluated: row.lastRunDate ? { date: row.lastRunDate, failed: failedState } : null,
    resultDate: row.resultRunDate,
    nextEvaluation,
    biggestGap: scores ? findBiggestGap(scores) : null,
  };
}

export async function fetchDocsReadinessSummary(
  project: string,
  now: DateTime = DateTime.utc(),
): Promise<DocsReadinessSummary | null> {
  const res = await fetchFromTinybird<TinybirdDocsReadinessSummary[]>(
    '/v0/pipes/project_doc_readiness_summary.json',
    { project },
  );
  const row = res.data[0];
  return row ? mapSummary(row, now) : null;
}
