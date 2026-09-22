// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  atDate,
  calledUrls,
  callsTo,
  developmentPath,
  mockFetch,
  pipeCalls,
  tinybirdHost,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
  type OpenApiOperation,
  type PipeResponder,
} from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/development/commit-activities';
const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';
const range = 'startDate=2025-01-01&endDate=2025-03-31';
const repos = `repos=${encodeURIComponent(k8sRepo)}&repos=${encodeURIComponent(websiteRepo)}`;
const baseQuery = `${range}&granularity=monthly&${repos}`;

const currentStart = '2025-01-01 00:00:00';
const previousStart = '2024-10-01 00:00:00';
const previousEnd = '2024-12-31 00:00:00';
const summaryCounts: Record<string, number> = { [currentStart]: 120, [previousStart]: 100 };

const monthlyRows = [
  {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    activityCount: 40,
    cumulativeActivityCount: 40,
  },
  {
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    activityCount: 35,
    cumulativeActivityCount: 75,
  },
  {
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    activityCount: 45,
    cumulativeActivityCount: 120,
    extra: 'dropped',
  },
];

const expectedSummary = {
  current: 120,
  previous: 100,
  percentageChange: 20,
  changeValue: 20,
  periodFrom: '2025-01-01T00:00:00Z',
  periodTo: '2025-03-31T00:00:00Z',
};

const expectedRows = [
  { startDate: '2025-01-01T00:00:00Z', endDate: '2025-01-31T00:00:00Z', commits: 40 },
  { startDate: '2025-02-01T00:00:00Z', endDate: '2025-02-28T00:00:00Z', commits: 35 },
  { startDate: '2025-03-01T00:00:00Z', endDate: '2025-03-31T00:00:00Z', commits: 45 },
];

const activitiesCount = '/v0/pipes/activities_count.json';
const cumulativeCount = '/v0/pipes/activities_cumulative_count.json';

const defaultPipes: Record<string, PipeResponder> = {
  [activitiesCount]: (url) =>
    url.searchParams.has('granularity')
      ? monthlyRows
      : [{ activityCount: summaryCounts[url.searchParams.get('startDate') ?? ''] ?? 0 }],
  [cumulativeCount]: () => monthlyRows,
};

function stubTinybird(overrides: Record<string, PipeResponder> = {}, bucket?: unknown[]) {
  const pipes = { ...defaultPipes, ...overrides };
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      const respond = pipes[url.pathname];
      if (!respond) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      return respond(url);
    }, bucket),
  );
}

const params = (url: URL) => Object.fromEntries(url.searchParams);
const isSeries = (url: URL) => url.searchParams.has('granularity');

const { get } = useApp();

beforeEach(() => {
  stubTinybird();
});

describe('response shape (AC1, AC11)', () => {
  it('returns the period summary and new commits per bucket by default', async () => {
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ summary: expectedSummary, data: expectedRows });
  });

  it('reads a missing summary row or bucket count as 0', async () => {
    stubTinybird({
      [activitiesCount]: (url) =>
        isSeries(url) ? [{ startDate: '2025-01-01', endDate: '2025-01-31' }] : [],
    });
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: { ...expectedSummary, current: 0, previous: 0, percentageChange: 0, changeValue: 0 },
      data: [{ startDate: '2025-01-01T00:00:00Z', endDate: '2025-01-31T00:00:00Z', commits: 0 }],
    });
  });

  it('returns only the documented keys, dropping the rest of the pipe rows', async () => {
    const res = await get(`${route}?${baseQuery}`);
    const body = res.json<{ summary: object; data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'summary']);
    expect(Object.keys(body.summary).sort()).toEqual(Object.keys(expectedSummary).sort());
    for (const row of body.data) {
      expect(Object.keys(row).sort()).toEqual(['commits', 'endDate', 'startDate']);
    }
  });
});

describe('Tinybird calls (AC2, AC3)', () => {
  it('makes the three pipe calls Nuxt makes', async () => {
    await get(`${route}?${baseQuery}`);
    for (const url of calledUrls()) {
      expect(url.origin).toBe(tinybirdHost);
    }

    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const url of calls) {
      expect(url.pathname).toBe(activitiesCount);
      expect(params(url)).toMatchObject({
        project: 'kubernetes',
        activity_type: 'authored-commit',
        onlyContributions: 'true',
        includeCodeContributions: 'true',
        includeCollaborations: 'false',
      });
      expect(url.searchParams.has('countType')).toBe(false);
    }

    const summaries = calls.filter((url) => !isSeries(url));
    expect(summaries.map((url) => [params(url).startDate, params(url).endDate])).toEqual(
      expect.arrayContaining([
        [currentStart, '2025-03-31 00:00:00'],
        [previousStart, previousEnd],
      ]),
    );
    expect(summaries).toHaveLength(2);

    const series = calls.filter(isSeries);
    expect(series).toHaveLength(1);
    expect(params(series[0] as URL)).toMatchObject({
      granularity: 'monthly',
      startDate: currentStart,
      endDate: '2025-03-31 00:00:00',
    });
  });
});

describe('countType (AC4)', () => {
  it('reads the cumulative series from activities_cumulative_count and its running total', async () => {
    const res = await get(`${route}?${baseQuery}&countType=cumulative`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: expectedSummary,
      data: expectedRows.map((row, i) => ({ ...row, commits: [40, 75, 120][i] })),
    });

    const summaries = callsTo(activitiesCount);
    expect(summaries).toHaveLength(2);
    expect(summaries.some(isSeries)).toBe(false);

    const series = callsTo(cumulativeCount);
    expect(series).toHaveLength(1);
    expect(params(series[0] as URL)).toMatchObject({
      granularity: 'monthly',
      bucketId: '7',
      activity_type: 'authored-commit',
      repos: `${k8sRepo},${websiteRepo}`,
      startDate: currentStart,
      endDate: '2025-03-31 00:00:00',
    });
    expect(series[0]?.searchParams.has('countType')).toBe(false);
  });

  it('accepts countType=new explicitly', async () => {
    const res = await get(`${route}?${baseQuery}&countType=new`);
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual(expectedRows);
    expect(callsTo(cumulativeCount)).toHaveLength(0);
  });

  it('rejects an unknown countType', async () => {
    const res = await get(`${route}?${baseQuery}&countType=total`);
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('granularity (AC5)', () => {
  it('is forwarded on the series call only', async () => {
    const res = await get(`${route}?${range}&granularity=weekly`);
    expect(res.statusCode).toBe(200);
    const calls = callsTo(activitiesCount);
    expect(calls.filter(isSeries).map((url) => params(url).granularity)).toEqual(['weekly']);
    expect(calls.filter((url) => !isSeries(url))).toHaveLength(2);
  });
});

describe('date range (AC6)', () => {
  it('sends the resolved 2010-01-01..today range to the pipes when the caller omits dates', async () => {
    await atDate('2025-03-31T12:00:00Z', async () => {
      const res = await get(`${route}?granularity=monthly`);
      expect(res.statusCode).toBe(200);
      expect(res.json().summary).toMatchObject({
        periodFrom: '2010-01-01T00:00:00Z',
        periodTo: '2025-03-31T00:00:00Z',
      });

      // The pipes count exactly the range the summary reports, so no pre-2010 commit slips in.
      const calls = callsTo(activitiesCount);
      const current = calls.filter((url) => params(url).startDate === '2010-01-01 00:00:00');
      expect(current).toHaveLength(2);
      for (const url of current) {
        expect(params(url).endDate).toBe('2025-03-31 00:00:00');
      }
      expect(current.filter(isSeries)).toHaveLength(1);

      const previous = calls.filter((url) => !current.includes(url));
      expect(previous.map(params)).toEqual([
        expect.objectContaining({
          startDate: '1994-10-01 00:00:00',
          endDate: '2009-12-31 00:00:00',
        }),
      ]);
      expect(previous[0]?.searchParams.has('granularity')).toBe(false);
    });
  });
});

describe('unknown slug (AC7)', () => {
  it('returns 200 with a zero summary and no buckets', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    stubTinybird({}, []);
    const res = await get(
      `/v1-alpha/projects/no-such-project/development/commit-activities?${baseQuery}`,
    );
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: { ...expectedSummary, current: 0, previous: 0, percentageChange: 0, changeValue: 0 },
      data: [],
    });
    vi.restoreAllMocks();
  });
});

describe('Tinybird failures (AC8)', () => {
  it('maps a series row without bucket dates to 503 upstream_unavailable', async () => {
    const upstreamDetail = 'tinybird internal detail';
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    stubTinybird({
      [activitiesCount]: (url) =>
        isSeries(url)
          ? [{ activityCount: 5, detail: upstreamDetail }]
          : defaultPipes[activitiesCount]!(url),
    });
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
    vi.restoreAllMocks();
  });
});

describe('caching headers (AC9)', () => {
  it('sets Cache-Control: private, max-age=0 on a validation error', async () => {
    const res = await get(`${route}?${range}`);
    expect(res.statusCode).toBe(400);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });
});

describe('OpenAPI (AC10)', () => {
  async function getOperation(): Promise<OpenApiOperation> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    const operation = res.json<OpenApiDoc>().paths[developmentPath('commit-activities')]?.get;
    expect(operation, 'commit-activities is missing from the spec').toBeDefined();
    return operation as OpenApiOperation;
  }

  it('documents the query parameters, with countType an optional new or cumulative switch', async () => {
    const operation = await getOperation();
    const byName = Object.fromEntries((operation.parameters ?? []).map((p) => [p.name, p]));
    for (const name of ['repos', 'startDate', 'endDate', 'granularity', 'countType']) {
      expect(byName[name]?.in, `${name} is not a query parameter`).toBe('query');
    }
    expect(byName.countType?.required).toBeFalsy();
    expect(byName.countType?.schema.enum).toEqual(['new', 'cumulative']);
    expect(byName.countType?.schema.default).toBe('new');
  });

  it('types percentageChange as nullable, the dates as date-time and commits as an integer', async () => {
    const operation = await getOperation();
    const schema = operation.responses['200']?.content['application/json']?.schema;

    const summary = schema?.properties?.summary;
    expect(summary?.properties?.percentageChange).toMatchObject({ type: 'number', nullable: true });
    expect(summary?.properties?.periodFrom?.format).toBe('date-time');
    expect(summary?.properties?.periodTo?.format).toBe('date-time');

    const row = schema?.properties?.data?.items;
    expect(row?.properties?.startDate?.format).toBe('date-time');
    expect(row?.properties?.endDate?.format).toBe('date-time');
    expect(row?.properties?.commits?.type).toBe('integer');
  });
});
