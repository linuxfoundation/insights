// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import { callsTo, mockFetch, queryString, tinybirdStub, useApp } from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/security/vulnerabilities/by-ecosystem';
const pipePath = '/v0/pipes/vulnerabilities_by_ecosystem.json';

const repo = 'https://github.com/kubernetes/kubernetes';

let rows: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  rows = [
    { packageEcosystem: 'Go', count: 6, percentage: 60 },
    { packageEcosystem: 'npm', count: 4, percentage: 40 },
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
  it('returns each ecosystem with its count and share', async () => {
    expect((await get(route)).json()).toEqual({
      data: [
        { ecosystem: 'Go', count: 6, percentage: 60 },
        { ecosystem: 'npm', count: 4, percentage: 40 },
      ],
    });
  });

  it('answers null for an empty ecosystem and keeps its share', async () => {
    rows = [
      { packageEcosystem: 'Go', count: 3, percentage: 75 },
      { packageEcosystem: '', count: 1, percentage: 25 },
    ];
    expect((await get(route)).json().data).toEqual([
      { ecosystem: 'Go', count: 3, percentage: 75 },
      { ecosystem: null, count: 1, percentage: 25 },
    ]);
  });

  it('orders by count, then by ecosystem name', async () => {
    rows = [
      { packageEcosystem: 'npm', count: 2, percentage: 20 },
      { packageEcosystem: 'PyPI', count: 1, percentage: 10 },
      { packageEcosystem: 'Go', count: 2, percentage: 20 },
      { packageEcosystem: 'Maven', count: 5, percentage: 50 },
    ];
    const ecosystems = (await get(route))
      .json()
      .data.map((item: { ecosystem: string }) => item.ecosystem);
    expect(ecosystems).toEqual(['Maven', 'Go', 'npm', 'PyPI']);
  });
});

describe('row guard (AC3)', () => {
  it.each([
    ['a missing ecosystem', { count: 1, percentage: 10 }],
    ['a negative count', { packageEcosystem: 'Go', count: -1, percentage: 10 }],
    ['a missing percentage', { packageEcosystem: 'Go', count: 1 }],
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
