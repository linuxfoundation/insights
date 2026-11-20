// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { DocsReadinessHistory } from '~~/types/docs-readiness/readiness.types';

import { fetchFromTinybird } from '../tinybird';

export type TinybirdDocsReadinessHistory = {
  month: string;
  score: number | null;
  failedOnly: number;
  docsUrl: string;
  urlChanged: number;
  firstEvaluatedMonth: string | null;
};

export function mapHistory(rows: TinybirdDocsReadinessHistory[]): DocsReadinessHistory {
  return {
    firstEvaluatedMonth: rows[0]?.firstEvaluatedMonth ?? null,
    months: rows.map((row) => ({
      month: row.month,
      score: row.score,
      failed: row.failedOnly === 1,
      docsUrl: row.docsUrl,
      urlChanged: row.urlChanged === 1,
    })),
  };
}

export async function fetchDocsReadinessHistory(project: string): Promise<DocsReadinessHistory> {
  const res = await fetchFromTinybird<TinybirdDocsReadinessHistory[]>(
    '/v0/pipes/project_doc_readiness_history.json',
    { project },
  );
  return mapHistory(res.data);
}
