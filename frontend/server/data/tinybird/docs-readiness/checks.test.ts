// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  kyvernoCheckRows,
  mockChecksKyverno,
} from '../../../mocks/tinybird-docs-readiness-checks.mock';
import { mockSummaryScored } from '../../../mocks/tinybird-docs-readiness-summary.mock';
import { fetchDocsReadinessChecks, mapChecks, type TinybirdDocsReadinessCheck } from './checks';

const mockFetchFromTinybird = vi.hoisted(() => vi.fn());

vi.mock('../tinybird', () => ({ fetchFromTinybird: mockFetchFromTinybird }));

const kyvernoScores = {
  'content-discoverability': 0,
  'markdown-availability': 0,
  'page-size': 67,
  'content-structure': 100,
  'url-stability': 100,
  observability: 100,
  authentication: 100,
};
const fullScores = Object.fromEntries(Object.keys(kyvernoScores).map((key) => [key, 100]));

const check = (
  checkId: string,
  status: string,
  overrides: Partial<TinybirdDocsReadinessCheck> = {},
): TinybirdDocsReadinessCheck => ({
  checkId,
  category: 'content-structure',
  status,
  message: `${checkId} message`,
  testedPages: 1,
  totalPages: 1,
  maxTestedPages: 1,
  ...overrides,
});

const DEPENDENCY = 'Skipped: dependency check did not pass';
const category = (result: ReturnType<typeof mapChecks>, key: string) =>
  result.categories.find((c) => c.key === key)!;

describe('docs readiness checks', () => {
  it('kyverno fixture: counts 8 passed, 0 need attention, 6 failed, 9 skipped; points 0/0/10/10/10/10/10', () => {
    const result = mapChecks(kyvernoCheckRows, kyvernoScores);
    expect(result.counts).toEqual({ passed: 8, needsAttention: 0, failed: 6, skipped: 9 });
    expect(result.categories.map((c) => c.points)).toEqual([0, 0, 10, 10, 10, 10, 10]);
    expect(result.categories.map((c) => c.key)).toEqual(Object.keys(kyvernoScores));
  });

  it('groups by the stored category, not by check id', () => {
    const result = mapChecks(
      [check('llms-txt-valid', 'pass', { category: 'observability' })],
      fullScores,
    );
    expect(category(result, 'observability').checks.map((c) => c.id)).toEqual(['llms-txt-valid']);
    expect(category(result, 'content-discoverability').checks).toEqual([]);
  });

  it("orders checks failed, couldn't run, needs attention, passed, skipped", () => {
    const rows = ['skip', 'pass', 'warn', 'error', 'fail'].map((s) => check(`c-${s}`, s));
    expect(
      category(mapChecks(rows, fullScores), 'content-structure').checks.map((c) => c.status),
    ).toEqual(['fail', 'error', 'warn', 'pass', 'skip']);
  });

  it('keeps checkId order inside one status', () => {
    const rows = [check('a', 'fail'), check('b', 'fail'), check('c', 'fail')];
    expect(
      category(mapChecks(rows, fullScores), 'content-structure').checks.map((c) => c.id),
    ).toEqual(['a', 'b', 'c']);
  });

  it("counts errors with failed, overall and against the category's passed/applicable", () => {
    const rows = [check('a', 'fail'), check('b', 'error'), check('c', 'pass')];
    const result = mapChecks(rows, fullScores);
    expect(result.counts.failed).toBe(2);
    expect(category(result, 'content-structure')).toMatchObject({ passed: 1, applicable: 3 });
  });

  it('needsAttention counts warnings per category', () => {
    const rows = [
      check('a', 'warn'),
      check('b', 'warn'),
      check('c', 'warn', { category: 'page-size' }),
    ];
    const result = mapChecks(rows, fullScores);
    expect(category(result, 'content-structure').needsAttention).toBe(2);
    expect(category(result, 'page-size').needsAttention).toBe(1);
    expect(result.counts.needsAttention).toBe(3);
  });

  it.each([
    'llms-txt-valid',
    'llms-txt-size',
    'llms-txt-links-resolve',
    'llms-txt-links-markdown',
    'llms-txt-coverage',
  ])('replaces the dependency skip message for llms.txt-dependent check %s', (id) => {
    const checks = category(
      mapChecks([check(id, 'skip', { message: DEPENDENCY })], fullScores),
      'content-structure',
    ).checks;
    expect(checks[0]).toMatchObject({
      skipReason: 'needs-llms-txt',
      message: 'Needs an llms.txt file',
    });
  });

  it.each(['llms-txt-directive-md', 'markdown-content-parity', 'page-size-markdown'])(
    'replaces the dependency skip message for Markdown-dependent check %s',
    (id) => {
      const checks = category(
        mapChecks([check(id, 'skip', { message: DEPENDENCY })], fullScores),
        'content-structure',
      ).checks;
      expect(checks[0]).toMatchObject({
        skipReason: 'needs-markdown',
        message: 'Needs a Markdown version of pages',
      });
    },
  );

  it('keeps the stored message for any other skip', () => {
    const rows = [
      check('auth-alternative-access', 'skip', {
        message: 'All docs pages are publicly accessible; no alternative access paths needed',
      }),
      check('markdown-code-fence-validity', 'skip', {
        message: 'Site does not serve markdown content; nothing to analyze',
      }),
    ];
    const checks = category(mapChecks(rows, fullScores), 'content-structure').checks;
    expect(checks.map((c) => c.message)).toEqual([
      'All docs pages are publicly accessible; no alternative access paths needed',
      'Site does not serve markdown content; nothing to analyze',
    ]);
    expect(checks.every((c) => c.skipReason === null)).toBe(true);
  });

  it('keeps the stored message when a dependent check is skipped for another reason', () => {
    const rows = [check('llms-txt-valid', 'skip', { message: 'Skipped: no pages to test' })];
    expect(category(mapChecks(rows, fullScores), 'content-structure').checks[0]).toMatchObject({
      message: 'Skipped: no pages to test',
      skipReason: null,
    });
  });

  it('does not touch the message of a dependent check that ran', () => {
    const rows = [check('llms-txt-directive-md', 'fail', { message: 'Could not fetch markdown' })];
    expect(category(mapChecks(rows, fullScores), 'content-structure').checks[0]).toMatchObject({
      status: 'fail',
      message: 'Could not fetch markdown',
      skipReason: null,
    });
  });

  it('passes unknown check ids through with the stored message', () => {
    const rows = [check('brand-new-check', 'skip', { message: DEPENDENCY })];
    expect(category(mapChecks(rows, fullScores), 'content-structure').checks[0]).toMatchObject({
      id: 'brand-new-check',
      message: DEPENDENCY,
      skipReason: null,
    });
  });

  it('puts an unknown category after the known ones with null weight and points', () => {
    const rows = [
      check('x', 'pass', { category: 'zeta' }),
      check('y', 'pass', { category: 'alpha' }),
    ];
    const result = mapChecks(rows, { ...fullScores, zeta: 80 });
    expect(result.categories.slice(7).map((c) => c.key)).toEqual(['alpha', 'zeta']);
    expect(category(result, 'zeta')).toMatchObject({
      name: 'zeta',
      description: '',
      weight: null,
      points: null,
      percent: 80,
    });
  });

  it('all-skipped category: notAssessed, stored 100 percent, full points', () => {
    const rows = [check('a', 'skip'), check('b', 'skip')];
    expect(category(mapChecks(rows, fullScores), 'content-structure')).toMatchObject({
      notAssessed: true,
      applicable: 0,
      percent: 100,
      points: 10,
    });
  });

  it('known category with no check rows is reported as not assessed with full points', () => {
    const result = mapChecks([check('a', 'pass')], fullScores);
    expect(category(result, 'authentication')).toMatchObject({
      checks: [],
      notAssessed: true,
      points: 10,
    });
  });

  it('points use the stored percentage, never one derived from the checks', () => {
    const rows = [check('a', 'pass'), check('b', 'pass'), check('c', 'fail')];
    expect(
      category(mapChecks(rows, { ...fullScores, 'content-structure': 50 }), 'content-structure'),
    ).toMatchObject({
      percent: 50,
      points: 5,
    });
  });

  it("treats an unknown status as couldn't run", () => {
    const result = mapChecks([check('a', 'weird')], fullScores);
    const [only] = category(result, 'content-structure').checks;
    expect(only!.status).toBe('error');
    expect(result.counts.failed).toBe(1);
    expect(category(result, 'content-structure')).toMatchObject({ applicable: 1, passed: 0 });
  });

  it.each([
    [4, 4],
    [null, null],
    [1, 1],
  ])('pagesTested comes from maxTestedPages (%s -> %s)', (max, expected) => {
    expect(mapChecks([check('a', 'pass', { maxTestedPages: max })], fullScores).pagesTested).toBe(
      expected,
    );
  });

  it('passes testedPages and totalPages through per check', () => {
    const rows = [check('a', 'pass', { testedPages: 3, totalPages: 12 })];
    expect(category(mapChecks(rows, fullScores), 'content-structure').checks[0]).toMatchObject({
      testedPages: 3,
      totalPages: 12,
    });
  });

  it('returns an empty result when there are no check rows', () => {
    expect(mapChecks([], fullScores)).toEqual({
      pagesTested: null,
      counts: { passed: 0, needsAttention: 0, failed: 0, skipped: 0 },
      categories: [],
    });
  });

  it('returns an empty result when the summary has no category scores', () => {
    expect(mapChecks(kyvernoCheckRows, null).categories).toEqual([]);
  });

  describe('fetchDocsReadinessChecks', () => {
    beforeEach(() => {
      mockFetchFromTinybird.mockReset();
    });

    it('reads the checks and summary pipes with separate query objects', async () => {
      mockFetchFromTinybird.mockImplementation(async (path: string) =>
        path.includes('checks') ? mockChecksKyverno : mockSummaryScored,
      );

      const result = await fetchDocsReadinessChecks('opentelemetry');

      expect(mockFetchFromTinybird).toHaveBeenCalledTimes(2);
      const [checksCall, summaryCall] = mockFetchFromTinybird.mock.calls;
      expect(checksCall).toEqual([
        '/v0/pipes/project_doc_readiness_checks.json',
        { project: 'opentelemetry' },
      ]);
      expect(summaryCall).toEqual([
        '/v0/pipes/project_doc_readiness_summary.json',
        { project: 'opentelemetry' },
      ]);
      expect(checksCall![1]).not.toBe(summaryCall![1]);
      expect(result.counts.passed).toBe(8);
    });
  });
});
