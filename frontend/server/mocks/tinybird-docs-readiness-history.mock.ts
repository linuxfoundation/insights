// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { TinybirdDocsReadinessHistory } from '~~/server/data/tinybird/docs-readiness/history';

const response = (data: TinybirdDocsReadinessHistory[]) => ({
  meta: [],
  data,
  rows: data.length,
  statistics: { elapsed: 0.01, rows_read: data.length, bytes_read: 1024 },
});

export const historyAswfRows: TinybirdDocsReadinessHistory[] = [
  {
    month: '2026-09-01',
    score: 40,
    failedOnly: 0,
    docsUrl: 'https://l.aswf.io/',
    urlChanged: 0,
    firstEvaluatedMonth: '2026-09-01',
  },
  {
    month: '2026-10-01',
    score: 54,
    failedOnly: 0,
    docsUrl: 'https://www.aswf.io/',
    urlChanged: 1,
    firstEvaluatedMonth: '2026-09-01',
  },
  {
    month: '2026-11-01',
    score: 54,
    failedOnly: 0,
    docsUrl: 'https://www.aswf.io/',
    urlChanged: 0,
    firstEvaluatedMonth: '2026-09-01',
  },
];

export const historyCdk8sRows: TinybirdDocsReadinessHistory[] = [
  '2026-09-01',
  '2026-10-01',
  '2026-11-01',
].map((month) => ({
  month,
  score: null,
  failedOnly: 1,
  docsUrl: 'https://cdk8s.io/docs',
  urlChanged: 0,
  firstEvaluatedMonth: '2026-09-01',
}));

export const mockHistory = response(historyAswfRows);
export const mockHistoryFailedOnly = response(historyCdk8sRows);
export const mockHistoryEmpty = response([]);
