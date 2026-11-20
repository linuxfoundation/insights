// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  historyAswfRows,
  historyCdk8sRows,
  mockHistory,
} from '../../../mocks/tinybird-docs-readiness-history.mock';
import { fetchDocsReadinessHistory, mapHistory } from './history';

const mockFetchFromTinybird = vi.hoisted(() => vi.fn());

vi.mock('../tinybird', () => ({ fetchFromTinybird: mockFetchFromTinybird }));

describe('docs readiness history', () => {
  it('maps months in pipe order with boolean flags', () => {
    expect(mapHistory(historyAswfRows)).toEqual({
      firstEvaluatedMonth: '2026-09-01',
      months: [
        {
          month: '2026-09-01',
          score: 40,
          failed: false,
          docsUrl: 'https://l.aswf.io/',
          urlChanged: false,
        },
        {
          month: '2026-10-01',
          score: 54,
          failed: false,
          docsUrl: 'https://www.aswf.io/',
          urlChanged: true,
        },
        {
          month: '2026-11-01',
          score: 54,
          failed: false,
          docsUrl: 'https://www.aswf.io/',
          urlChanged: false,
        },
      ],
    });
  });

  it('marks failure-only months and keeps a null score', () => {
    const { months } = mapHistory(historyCdk8sRows);
    expect(months).toHaveLength(3);
    expect(months[0]).toEqual({
      month: '2026-09-01',
      score: null,
      failed: true,
      docsUrl: 'https://cdk8s.io/docs',
      urlChanged: false,
    });
  });

  it('returns no months and a null firstEvaluatedMonth for an empty result', () => {
    expect(mapHistory([])).toEqual({ firstEvaluatedMonth: null, months: [] });
  });

  describe('fetchDocsReadinessHistory', () => {
    beforeEach(() => {
      mockFetchFromTinybird.mockReset();
    });

    it('calls the history pipe with the project only', async () => {
      mockFetchFromTinybird.mockResolvedValueOnce(mockHistory);

      const history = await fetchDocsReadinessHistory('aswf');

      expect(mockFetchFromTinybird).toHaveBeenCalledWith(
        '/v0/pipes/project_doc_readiness_history.json',
        { project: 'aswf' },
      );
      expect(history.months).toHaveLength(3);
    });
  });
});
