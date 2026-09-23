// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import {
  callsTo,
  mockFetch,
  projectPath,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
  type OpenApiOperation,
} from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/popularity/package-metrics';
const baseQuery = 'startDate=2025-01-01&endDate=2025-03-31&granularity=monthly';
const pipePath = '/v0/pipes/package_metrics.json';

const currentStart = '2025-01-01 00:00:00';
const previousStart = '2024-10-01 00:00:00';

const summaryRows: Record<string, Record<string, number>> = {
  [currentStart]: {
    downloadsCount: 1200,
    dockerDownloadsCount: 300,
    dockerDependentsCount: 40,
    dependentPackagesCount: 90,
    dependentReposCount: 25,
  },
  [previousStart]: {
    downloadsCount: 1000,
    dockerDownloadsCount: 0,
    dockerDependentsCount: 50,
    dependentPackagesCount: 90,
    dependentReposCount: 20,
  },
};

const seriesRows = [
  {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    downloadsCount: 1100,
    dockerDownloadsCount: 250,
    dockerDependentsCount: 45,
    dependentPackagesCount: 88,
    dependentReposCount: 22,
  },
  {
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    downloadsCount: 1200,
    dockerDownloadsCount: 300,
    dockerDependentsCount: 40,
    dependentPackagesCount: 90,
    dependentReposCount: 25,
  },
];

const isSeries = (url: URL) => url.searchParams.has('granularity');
const params = (url: URL) => Object.fromEntries(url.searchParams);

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname !== pipePath) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      if (isSeries(url)) {
        return seriesRows;
      }
      const row = summaryRows[url.searchParams.get('startDate') ?? ''];
      return row ? [row] : [];
    }),
  );
});

const period = { periodFrom: '2025-01-01T00:00:00Z', periodTo: '2025-03-31T00:00:00Z' };

describe('response (AC1, AC2)', () => {
  it('returns one signed period summary per metric and the mapped buckets', async () => {
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: {
        downloads: {
          current: 1200,
          previous: 1000,
          percentageChange: 20,
          changeValue: 200,
          ...period,
        },
        dockerDownloads: {
          current: 300,
          previous: 0,
          percentageChange: null,
          changeValue: 300,
          ...period,
        },
        dockerDependents: {
          current: 40,
          previous: 50,
          percentageChange: -20,
          changeValue: -10,
          ...period,
        },
        dependentPackages: {
          current: 90,
          previous: 90,
          percentageChange: 0,
          changeValue: 0,
          ...period,
        },
        dependentRepos: {
          current: 25,
          previous: 20,
          percentageChange: 25,
          changeValue: 5,
          ...period,
        },
      },
      data: [
        {
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-01-31T00:00:00Z',
          downloads: 1100,
          dockerDownloads: 250,
          dockerDependents: 45,
          dependentPackages: 88,
          dependentRepos: 22,
        },
        {
          startDate: '2025-02-01T00:00:00Z',
          endDate: '2025-02-28T00:00:00Z',
          downloads: 1200,
          dockerDownloads: 300,
          dockerDependents: 40,
          dependentPackages: 90,
          dependentRepos: 25,
        },
      ],
    });
  });

  it('reads a missing summary row as zeros', async () => {
    const res = await get(`${route}?startDate=2024-01-01&endDate=2024-03-31&granularity=monthly`);
    expect(res.statusCode).toBe(200);
    expect(res.json().summary.downloads).toMatchObject({
      current: 0,
      previous: 0,
      percentageChange: 0,
    });
  });
});

describe('Tinybird calls (AC3)', () => {
  it('sends the current and previous summaries and the series with the package filter', async () => {
    await get(`${route}?${baseQuery}&ecosystem=npm&name=left-pad`);
    const calls = callsTo(pipePath);
    expect(calls).toHaveLength(3);
    for (const url of calls) {
      expect(params(url)).toMatchObject({
        project: 'kubernetes',
        ecosystem: 'npm',
        name: 'left-pad',
      });
    }
    const summaries = calls.filter((url) => !isSeries(url)).map(params);
    expect(summaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ startDate: currentStart, endDate: '2025-03-31 00:00:00' }),
        expect.objectContaining({ startDate: previousStart, endDate: '2024-12-31 00:00:00' }),
      ]),
    );
    const series = calls.filter(isSeries).map(params);
    expect(series).toEqual([
      expect.objectContaining({
        startDate: currentStart,
        endDate: '2025-03-31 00:00:00',
        granularity: 'monthly',
      }),
    ]);
  });

  it('omits ecosystem and name when the caller sends none or empty ones', async () => {
    await get(`${route}?${baseQuery}`);
    await get(`${route}?${baseQuery}&ecosystem=&name=`);
    for (const url of callsTo(pipePath)) {
      expect(url.searchParams.has('ecosystem')).toBe(false);
      expect(url.searchParams.has('name')).toBe(false);
    }
  });
});

describe('unknown project (AC4)', () => {
  it('answers five zero summaries and no buckets', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => [], []));
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(200);
    const zero = { current: 0, previous: 0, percentageChange: 0, changeValue: 0, ...period };
    expect(res.json()).toEqual({
      summary: {
        downloads: zero,
        dockerDownloads: zero,
        dockerDependents: zero,
        dependentPackages: zero,
        dependentRepos: zero,
      },
      data: [],
    });
  });
});

describe('malformed rows', () => {
  const summaryStub = (row: unknown) => tinybirdStub((url) => (isSeries(url) ? seriesRows : [row]));

  it.each([
    ['an array', []],
    ['a negative count', { downloadsCount: -1 }],
    ['a fractional count', { downloadsCount: 1.5 }],
  ])('answers 503 when a summary row is %s', async (_, row) => {
    mockFetch.mockImplementation(summaryStub(row));
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(503);
  });

  it('answers 503 when a series row has no start date', async () => {
    mockFetch.mockImplementation(
      tinybirdStub((url) =>
        isSeries(url) ? [{ ...seriesRows[0], startDate: null }] : [summaryRows[currentStart]],
      ),
    );
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(503);
  });

  it('answers 503 when a series row has a non-numeric count', async () => {
    mockFetch.mockImplementation(
      tinybirdStub((url) =>
        isSeries(url)
          ? [{ ...seriesRows[0], downloadsCount: '1100' }]
          : [summaryRows[currentStart]],
      ),
    );
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(503);
  });
});

describe('OpenAPI (AC5)', () => {
  it('publishes ecosystem and name as optional strings', async () => {
    const res = await get('/v1-alpha/openapi.json');
    const operation = res.json<OpenApiDoc>().paths[projectPath('popularity/package-metrics')]
      ?.get as OpenApiOperation | undefined;
    expect(operation, 'package-metrics is missing from the spec').toBeDefined();
    for (const name of ['ecosystem', 'name']) {
      const param = operation?.parameters?.find((p) => p.name === name);
      expect(param?.required, name).toBeFalsy();
      expect(param?.schema.type, name).toBe('string');
    }
  });
});
