// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mockSummaryConfirmedNoDocs,
  mockSummaryEmpty,
  mockSummaryFailed,
  mockSummaryLatestFailed,
  mockSummaryNoDocs,
  mockSummaryNotEvaluated,
  mockSummaryRepoOnly,
  mockSummaryScored,
  mockSummaryScoredOverride,
  row,
  scoredRow,
} from '../../../mocks/tinybird-docs-readiness-summary.mock';
import { fetchDocsReadinessSummary, getNextEvaluationAt, mapSummary } from './summary';

const mockFetchFromTinybird = vi.hoisted(() => vi.fn());

vi.mock('../tinybird', () => ({ fetchFromTinybird: mockFetchFromTinybird }));
const now = DateTime.utc(2026, 11, 20, 10);
const NEXT = '2026-12-01T02:00:00.000Z';

const first = (response: { data: Parameters<typeof mapSummary>[0][] }) =>
  mapSummary(response.data[0]!, now);

describe('docs readiness summary', () => {
  it.each([
    ['2026-11-20T10:00:00Z', '2026-12-01T02:00:00.000Z'],
    ['2026-12-01T01:59:00Z', '2026-12-01T02:00:00.000Z'],
    ['2026-12-01T02:00:00Z', '2027-01-01T02:00:00.000Z'],
    ['2026-12-31T23:59:00Z', '2027-01-01T02:00:00.000Z'],
    ['2026-11-30T20:00:00-08:00', '2027-01-01T02:00:00.000Z'],
  ])('getNextEvaluationAt %s -> %s', (input, expected) => {
    expect(getNextEvaluationAt(DateTime.fromISO(input, { setZone: true }))).toBe(expected);
  });

  it('scored: score, median above, discovery and confidence labels, next evaluation scheduled', () => {
    expect(first(mockSummaryScored)).toEqual({
      state: 'scored',
      score: 77,
      median: { value: 50, delta: 27, direction: 'above' },
      docsUrl: 'https://opentelemetry.io/docs',
      repoUrl: null,
      isOverride: false,
      discovery: { method: 'docs-path', label: 'Found at a /docs path' },
      confidence: {
        level: 'medium',
        label: 'Medium confidence',
        tooltip:
          'This is probably the project’s docs site. If it isn’t, you can request a correction.',
      },
      lastEvaluated: { date: '2026-11-01', failed: false },
      resultDate: '2026-11-01',
      nextEvaluation: { at: NEXT, retryingDaily: false },
      biggestGap: { key: 'page-size', name: 'Page size', earned: 8, weight: 15 },
    });
  });

  it('scored with an override: Confirmed by LF team / Confirmed labels, isOverride true', () => {
    const summary = first(mockSummaryScoredOverride);
    expect(summary.isOverride).toBe(true);
    expect(summary.discovery?.label).toBe('Confirmed by LF team');
    expect(summary.confidence?.label).toBe('Confirmed');
    expect(summary.median).toEqual({ value: 50, delta: 10, direction: 'below' });
  });

  it('median is equal when the score matches the LF median', () => {
    expect(mapSummary({ ...scoredRow, overallScore: 50 }, now).median).toEqual({
      value: 50,
      delta: 0,
      direction: 'equal',
    });
  });

  it('median keeps a half-point LF median', () => {
    expect(mapSummary({ ...scoredRow, overallScore: 45, lfMedian: 50.5 }, now).median).toEqual({
      value: 50.5,
      delta: 5.5,
      direction: 'below',
    });
  });

  it('median is null when the LF median is null', () => {
    expect(mapSummary({ ...scoredRow, lfMedian: null }, now).median).toBeNull();
  });

  it('no-docs: no URL, no labels, not marked failed, next evaluation scheduled', () => {
    expect(first(mockSummaryNoDocs)).toMatchObject({
      state: 'no-docs',
      score: null,
      docsUrl: null,
      discovery: null,
      confidence: null,
      lastEvaluated: { date: '2026-11-01', failed: false },
      nextEvaluation: { at: NEXT, retryingDaily: false },
      biggestGap: null,
    });
  });

  it('confirmed-no-docs: isOverride true, no URL block, next evaluation scheduled', () => {
    expect(first(mockSummaryConfirmedNoDocs)).toMatchObject({
      state: 'confirmed-no-docs',
      isOverride: true,
      docsUrl: null,
      discovery: null,
      confidence: null,
      lastEvaluated: { date: '2026-11-01', failed: false },
      nextEvaluation: { at: NEXT, retryingDaily: false },
    });
  });

  it('repo-only: repoUrl set, docsUrl null, no labels, next evaluation scheduled', () => {
    expect(first(mockSummaryRepoOnly)).toMatchObject({
      state: 'repo-only',
      repoUrl: 'https://github.com/openmainframeproject/ade',
      docsUrl: null,
      discovery: null,
      confidence: null,
      lastEvaluated: { date: '2026-11-01', failed: false },
      nextEvaluation: { at: NEXT, retryingDaily: false },
    });
  });

  it('latest-failed: earlier score shown, lastEvaluated failed with the failed run date, resultDate older, retrying daily, biggest gap from the earlier result', () => {
    expect(first(mockSummaryLatestFailed)).toMatchObject({
      state: 'latest-failed',
      score: 70,
      lastEvaluated: { date: '2026-09-30', failed: true },
      resultDate: '2026-09-29',
      nextEvaluation: { at: null, retryingDaily: true },
      biggestGap: { key: 'page-size', earned: 4, weight: 15 },
    });
  });

  it('failed: failed URL kept with its labels, no score, no median, no gap, retrying daily', () => {
    expect(first(mockSummaryFailed)).toMatchObject({
      state: 'failed',
      score: null,
      median: null,
      biggestGap: null,
      docsUrl: 'https://cdk8s.io/docs',
      discovery: { label: 'Found at a /docs path' },
      confidence: { label: 'Medium confidence' },
      lastEvaluated: { date: '2026-11-20', failed: true },
      nextEvaluation: { at: null, retryingDaily: true },
    });
  });

  it('not-evaluated: no dates, no next evaluation', () => {
    expect(first(mockSummaryNotEvaluated)).toMatchObject({
      state: 'not-evaluated',
      score: null,
      lastEvaluated: null,
      resultDate: null,
      nextEvaluation: null,
    });
  });

  it('unknown method and confidence pass through as their own label', () => {
    const summary = mapSummary(
      { ...scoredRow, discoveryMethod: 'new-method', confidence: 'very-high' },
      now,
    );
    expect(summary.discovery).toEqual({ method: 'new-method', label: 'new-method' });
    expect(summary.confidence).toEqual({ level: 'very-high', label: 'very-high', tooltip: '' });
  });

  it('biggestGap is null when categoryScores is not valid JSON', () => {
    expect(mapSummary({ ...scoredRow, categoryScores: '{oops' }, now).biggestGap).toBeNull();
    expect(mapSummary(row({ overallScore: 60 }), now).biggestGap).toBeNull();
  });

  describe('fetchDocsReadinessSummary', () => {
    beforeEach(() => {
      mockFetchFromTinybird.mockReset();
    });

    it('calls the summary pipe with the project only', async () => {
      mockFetchFromTinybird.mockResolvedValueOnce(mockSummaryScored);

      const summary = await fetchDocsReadinessSummary('opentelemetry', now);

      expect(mockFetchFromTinybird).toHaveBeenCalledWith(
        '/v0/pipes/project_doc_readiness_summary.json',
        { project: 'opentelemetry' },
      );
      expect(summary?.score).toBe(77);
    });

    it('returns null for zero rows', async () => {
      mockFetchFromTinybird.mockResolvedValueOnce(mockSummaryEmpty);

      expect(await fetchDocsReadinessSummary('disabled', now)).toBeNull();
    });
  });
});
