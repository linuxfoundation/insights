// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import { callsTo, mockFetch, queryString, tinybirdStub, useApp } from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/security/vulnerabilities/by-severity';
const pipePath = '/v0/pipes/vulnerabilities_by_severity.json';

const repo = 'https://github.com/kubernetes/kubernetes';

let rows: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  rows = [
    { severity: 'HIGH', count: 6, percentage: 60 },
    { severity: 'LOW', count: 4, percentage: 40 },
  ];
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname !== pipePath) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      return rows;
    }),
  );
});

describe('Tinybird call (AC1)', () => {
  it('asks the pipe once for the project and repos', async () => {
    const res = await get(`${route}?${queryString({ repos: repo })}`);
    expect(res.statusCode).toBe(200);
    expect(callsTo(pipePath)).toHaveLength(1);
    const [call] = callsTo(pipePath);
    expect(call?.searchParams.get('project')).toBe('kubernetes');
    expect(call?.searchParams.get('repos')).toBe(repo);
  });
});

describe('response mapping (AC2)', () => {
  it('returns each severity with its count and share', async () => {
    expect((await get(route)).json()).toEqual({
      data: [
        { severity: 'HIGH', count: 6, percentage: 60 },
        { severity: 'LOW', count: 4, percentage: 40 },
      ],
    });
  });

  it('orders by count, then from the most severe down', async () => {
    rows = [
      { severity: 'UNKNOWN', count: 2, percentage: 20 },
      { severity: 'LOW', count: 2, percentage: 20 },
      { severity: 'MEDIUM', count: 1, percentage: 10 },
      { severity: 'CRITICAL', count: 5, percentage: 50 },
    ];
    const severities = (await get(route))
      .json()
      .data.map((item: { severity: string }) => item.severity);
    expect(severities).toEqual(['CRITICAL', 'LOW', 'UNKNOWN', 'MEDIUM']);
  });
});

describe('row guard (AC3)', () => {
  it.each([
    ['a severity outside the enum', { severity: 'SEVERE', count: 1, percentage: 10 }],
    ['a negative count', { severity: 'HIGH', count: -1, percentage: 10 }],
    ['a missing percentage', { severity: 'HIGH', count: 1 }],
  ])('answers 503 for %s', async (_label, row) => {
    rows = [row];
    expect((await get(route)).statusCode).toBe(503);
  });
});

describe('unknown project (AC4)', () => {
  it('answers an empty list without calling the pipe', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => rows, []));
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
    expect(callsTo(pipePath)).toHaveLength(0);
  });
});
