// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import {
  DOCS_READINESS_CATEGORIES,
  DOCS_READINESS_DEPENDENCY_SKIP_MESSAGE,
  DOCS_READINESS_SKIP_REASONS,
} from '~~/config/docs-readiness';
import type {
  DocsReadinessCategory,
  DocsReadinessCheck,
  DocsReadinessCheckStatus,
  DocsReadinessChecks,
} from '~~/types/docs-readiness/readiness.types';

import { fetchFromTinybird } from '../tinybird';
import { categoryPoints, parseCategoryScores } from './categories';
import type { TinybirdDocsReadinessSummary } from './summary';

export type TinybirdDocsReadinessCheck = {
  checkId: string;
  category: string;
  status: string;
  message: string;
  testedPages: number | null;
  totalPages: number | null;
  maxTestedPages: number | null;
};

const STATUS_ORDER: DocsReadinessCheckStatus[] = ['fail', 'error', 'warn', 'pass', 'skip'];

function toStatus(raw: string): DocsReadinessCheckStatus {
  return STATUS_ORDER.includes(raw as DocsReadinessCheckStatus)
    ? (raw as DocsReadinessCheckStatus)
    : 'error';
}

function toCheck(row: TinybirdDocsReadinessCheck): DocsReadinessCheck {
  const status = toStatus(row.status);
  const skip =
    status === 'skip' && row.message === DOCS_READINESS_DEPENDENCY_SKIP_MESSAGE
      ? DOCS_READINESS_SKIP_REASONS[row.checkId]
      : undefined;
  return {
    id: row.checkId,
    status,
    message: skip?.message ?? row.message,
    skipReason: skip?.reason ?? null,
    testedPages: row.testedPages,
    totalPages: row.totalPages,
  };
}

function buildCategory(
  key: string,
  meta: { name: string; description: string; weight: number } | null,
  checks: DocsReadinessCheck[],
  scores: Record<string, number>,
): DocsReadinessCategory {
  const applicable = checks.filter((check) => check.status !== 'skip').length;
  const percent = scores[key] ?? null;
  return {
    key,
    name: meta?.name ?? key,
    description: meta?.description ?? '',
    weight: meta?.weight ?? null,
    percent,
    points: meta && percent !== null ? categoryPoints(percent, meta.weight) : null,
    notAssessed: applicable === 0,
    passed: checks.filter((check) => check.status === 'pass').length,
    applicable,
    needsAttention: checks.filter((check) => check.status === 'warn').length,
    checks: [...checks].sort(
      (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    ),
  };
}

export function mapChecks(
  rows: TinybirdDocsReadinessCheck[],
  scores: Record<string, number> | null,
): DocsReadinessChecks {
  if (!rows.length || !scores) {
    return {
      pagesTested: null,
      counts: { passed: 0, needsAttention: 0, failed: 0, skipped: 0 },
      categories: [],
    };
  }

  const byCategory = new Map<string, DocsReadinessCheck[]>();
  const all: DocsReadinessCheck[] = [];
  for (const row of rows) {
    const check = toCheck(row);
    all.push(check);
    byCategory.set(row.category, [...(byCategory.get(row.category) ?? []), check]);
  }

  const known = new Set<string>(DOCS_READINESS_CATEGORIES.map((category) => category.key));
  const unknownKeys = [...byCategory.keys()].filter((key) => !known.has(key)).sort();
  const count = (...statuses: DocsReadinessCheckStatus[]) =>
    all.filter((check) => statuses.includes(check.status)).length;

  return {
    pagesTested: rows[0]!.maxTestedPages,
    counts: {
      passed: count('pass'),
      needsAttention: count('warn'),
      failed: count('fail', 'error'),
      skipped: count('skip'),
    },
    categories: [
      ...DOCS_READINESS_CATEGORIES.map((meta) =>
        buildCategory(meta.key, meta, byCategory.get(meta.key) ?? [], scores),
      ),
      ...unknownKeys.map((key) => buildCategory(key, null, byCategory.get(key)!, scores)),
    ],
  };
}

export async function fetchDocsReadinessChecks(project: string): Promise<DocsReadinessChecks> {
  const [checks, summary] = await Promise.all([
    fetchFromTinybird<TinybirdDocsReadinessCheck[]>('/v0/pipes/project_doc_readiness_checks.json', {
      project,
    }),
    fetchFromTinybird<TinybirdDocsReadinessSummary[]>(
      '/v0/pipes/project_doc_readiness_summary.json',
      { project },
    ),
  ]);
  return mapChecks(checks.data, parseCategoryScores(summary.data[0]?.categoryScores));
}
