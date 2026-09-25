// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import { callsTo, mockFetch, queryString, tinybirdStub, useApp } from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/security/vulnerabilities/summary';
const summaryPath = '/v0/pipes/vulnerabilities_summary.json';
const listPath = '/v0/pipes/vulnerabilities_list.json';

const repo = 'https://github.com/kubernetes/kubernetes';

const summaryRow = {
  count: 12,
  fixedPercentage: 33.33,
  daysSinceLastVuln: 4,
  avgCvssScore: 6.4,
  ecosystems: ['npm', 'Go'],
};

let summaryRows: unknown[] = [];
let countRows: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  summaryRows = [summaryRow];
  countRows = [{ count: 5 }];
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname === summaryPath) return summaryRows;
      if (url.pathname === listPath) return countRows;
      throw new Error(`unexpected Tinybird call to ${url.pathname}`);
    }),
  );
});

const empty = {
  count: 0,
  openCount: 0,
  fixedPercentage: 0,
  daysSinceLastVuln: null,
  avgCvssScore: null,
  ecosystems: [],
};

describe('Tinybird calls (AC1)', () => {
  it('asks the summary and the open count for the project and repos', async () => {
    const res = await get(`${route}?${queryString({ repos: repo })}`);
    expect(res.statusCode).toBe(200);
    const [summary] = callsTo(summaryPath);
    const [count] = callsTo(listPath);
    expect(callsTo(summaryPath)).toHaveLength(1);
    expect(callsTo(listPath)).toHaveLength(1);
    for (const call of [summary, count]) {
      expect(call?.searchParams.get('project')).toBe('kubernetes');
      expect(call?.searchParams.get('repos')).toBe(repo);
    }
    expect(count?.searchParams.get('status')).toBe('OPEN');
    expect(count?.searchParams.get('count')).toBe('true');
    expect(summary?.searchParams.has('status')).toBe(false);
  });
});

describe('response mapping (AC2, AC3)', () => {
  it('returns the summary with the open count and sorted ecosystems', async () => {
    const res = await get(route);
    expect(res.json()).toEqual({
      count: 12,
      openCount: 5,
      fixedPercentage: 33.33,
      daysSinceLastVuln: 4,
      avgCvssScore: 6.4,
      ecosystems: ['Go', 'npm'],
    });
  });

  it('drops empty ecosystem names', async () => {
    summaryRows = [{ ...summaryRow, ecosystems: ['', 'PyPI', 'npm'] }];
    expect((await get(route)).json().ecosystems).toEqual(['PyPI', 'npm']);
  });

  it('answers openCount 0 when the count call returns no row', async () => {
    countRows = [];
    expect((await get(route)).json().openCount).toBe(0);
  });

  it('keeps a null avgCvssScore', async () => {
    summaryRows = [{ ...summaryRow, avgCvssScore: null }];
    expect((await get(route)).json().avgCvssScore).toBeNull();
  });

  it('keeps daysSinceLastVuln when every vulnerability is resolved', async () => {
    summaryRows = [{ ...summaryRow, count: 0, fixedPercentage: 100, daysSinceLastVuln: 30 }];
    expect((await get(route)).json().daysSinceLastVuln).toBe(30);
  });

  it('answers daysSinceLastVuln null when the project has no vulnerabilities', async () => {
    summaryRows = [
      { count: 0, fixedPercentage: 0, daysSinceLastVuln: 0, avgCvssScore: null, ecosystems: [] },
    ];
    countRows = [{ count: 0 }];
    expect((await get(route)).json()).toEqual(empty);
  });
});

describe('row guard (AC4)', () => {
  it.each([
    ['a negative count', { ...summaryRow, count: -1 }],
    ['a fractional count', { ...summaryRow, count: 1.5 }],
    ['a string count', { ...summaryRow, count: '12' }],
    ['a negative daysSinceLastVuln', { ...summaryRow, daysSinceLastVuln: -2 }],
    ['a missing daysSinceLastVuln', { ...summaryRow, daysSinceLastVuln: undefined }],
    ['a fixedPercentage that is not a number', { ...summaryRow, fixedPercentage: '33' }],
    ['a negative fixedPercentage', { ...summaryRow, fixedPercentage: -1 }],
    ['a fixedPercentage above 100', { ...summaryRow, fixedPercentage: 101 }],
    ['an avgCvssScore that is not a number', { ...summaryRow, avgCvssScore: 'high' }],
    ['a negative avgCvssScore', { ...summaryRow, avgCvssScore: -0.1 }],
    ['an avgCvssScore above 10', { ...summaryRow, avgCvssScore: 11 }],
    ['a missing avgCvssScore', { ...summaryRow, avgCvssScore: undefined }],
    ['ecosystems that are not a list', { ...summaryRow, ecosystems: 'npm' }],
    ['an ecosystem that is not a string', { ...summaryRow, ecosystems: [3] }],
  ])('answers 503 for a summary with %s', async (_label, row) => {
    summaryRows = [row];
    expect((await get(route)).statusCode).toBe(503);
  });

  it.each([
    ['a negative count', [{ count: -1 }]],
    ['a string count', [{ count: '5' }]],
    ['a missing count', [{}]],
  ])('answers 503 for a count row with %s', async (_label, rows) => {
    countRows = rows;
    expect((await get(route)).statusCode).toBe(503);
  });
});

describe('empty answers (AC5)', () => {
  it('answers zeros when the summary returns no row', async () => {
    summaryRows = [];
    countRows = [];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(empty);
  });

  it('answers zeros for an unknown project without calling the pipes', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => [summaryRow], []));
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(empty);
    expect(callsTo(summaryPath)).toHaveLength(0);
    expect(callsTo(listPath)).toHaveLength(0);
  });
});
