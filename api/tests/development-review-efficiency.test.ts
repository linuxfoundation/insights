// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildApp } from '../src/app.js';
import { getTinybirdClient } from '../src/clients/tinybird.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const pipePath = '/v0/pipes/review_efficiency.json';
const bucketPath = '/v0/pipes/project_buckets.json';
const specPath = '/v1-alpha/projects/{slug}/development/review-efficiency';

const startDate = '2025-01-01';
const endDate = '2025-03-31';
// getPreviousDates shifts the range back by its calendar span (2 months 30 days here), ending
// the day before startDate.
const previousStart = '2024-10-01';
const previousEnd = '2024-12-31';
const atMidnight = (day: string) => `${day} 00:00:00`;
const isoDay = (day: string) => `${day}T00:00:00Z`;

const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';
const platforms = ['github', 'gitlab', 'gerrit'];

// The Nuxt data layer reads openedCount and resolvedCount from both the summary and the series
// rows; its stale series type says mergedCount, which the mapping never touches.
const currentRow = { openedCount: 80, resolvedCount: 60 };
const previousRow = { openedCount: 50, resolvedCount: 40 };
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', openedCount: 30, resolvedCount: 20 },
  { startDate: '2025-02-01', endDate: '2025-02-28', openedCount: 25, resolvedCount: 20 },
  { startDate: '2025-03-01', endDate: '2025-03-31', openedCount: 25, resolvedCount: 20 },
];

const period = { periodFrom: isoDay(startDate), periodTo: isoDay(endDate) };
const summaryKeys = [
  'current',
  'previous',
  'percentageChange',
  'changeValue',
  'periodFrom',
  'periodTo',
];
const bodyKeys = ['closedSummary', 'data', 'efficiencyPercentage', 'openedSummary'];
const bucketKeys = ['closed', 'endDate', 'opened', 'startDate'];

// 60 of 80 opened were closed (75%) against 40 of 50 (80%): down 5 points, minus 6.25 percent.
const expectedBody = {
  efficiencyPercentage: {
    current: 75,
    previous: 80,
    percentageChange: -6.25,
    changeValue: -5,
    ...period,
  },
  openedSummary: { current: 80, previous: 50, percentageChange: 60, changeValue: 30, ...period },
  closedSummary: { current: 60, previous: 40, percentageChange: 50, changeValue: 20, ...period },
  data: [
    { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), opened: 30, closed: 20 },
    { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), opened: 25, closed: 20 },
    { startDate: isoDay('2025-03-01'), endDate: isoDay('2025-03-31'), opened: 25, closed: 20 },
  ],
};

const nullEfficiency = {
  current: null,
  previous: null,
  percentageChange: null,
  changeValue: null,
  ...period,
};
const zeroSummary = { current: 0, previous: 0, percentageChange: 0, changeValue: 0, ...period };
const emptyBody = {
  efficiencyPercentage: nullEfficiency,
  openedSummary: zeroSummary,
  closedSummary: zeroSummary,
  data: [],
};

const tinybirdResponse = (rows: object[]) =>
  new Response(
    JSON.stringify({
      data: rows,
      meta: [],
      rows: rows.length,
      statistics: { elapsed: 0.01, rows_read: 1, bytes_read: 1 },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );

interface PipeRows {
  bucket?: object[];
  current?: object[];
  previous?: object[];
  series?: object[];
}

// The handler resolves the slug to a bucket once, then makes the three pipe calls. The series
// call is the one that carries granularity; the two summary calls differ by their startDate.
const routeTinybird =
  ({
    bucket = [{ bucketId: 7 }],
    current = [currentRow],
    previous = [previousRow],
    series = seriesRows,
  }: PipeRows = {}) =>
  async (input: unknown) => {
    const url = new URL(String(input));
    if (url.pathname === bucketPath) {
      return tinybirdResponse(bucket);
    }
    if (url.searchParams.has('granularity')) {
      return tinybirdResponse(series);
    }
    const isPrevious = url.searchParams.get('startDate') === atMidnight(previousStart);
    return tinybirdResponse(isPrevious ? previous : current);
  };

const callsTo = (path: string) =>
  mockFetch.mock.calls
    .map((call) => new URL(String(call[0])))
    .filter((url) => url.pathname === path);
const pipeCalls = () => callsTo(pipePath);

const defaultQuery = { startDate, endDate, granularity: 'monthly' };

function url(params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...defaultQuery, ...params })) {
    for (const item of [value].flat()) {
      if (item !== undefined) {
        search.append(key, item);
      }
    }
  }
  return `/v1-alpha/projects/${slug}/development/review-efficiency?${search}`;
}

interface OpenApiSchema {
  type?: string;
  nullable?: boolean;
  description?: string;
  enum?: string[];
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
}

interface OpenApiParameter {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema: OpenApiSchema;
}

interface OpenApiOperation {
  tags?: string[];
  description?: string;
  parameters?: OpenApiParameter[];
  responses: Record<string, { content: Record<string, { schema: OpenApiSchema }> }>;
}

interface OpenApiDoc {
  paths: Record<string, { get?: OpenApiOperation }>;
}

let app: FastifyInstance;

beforeAll(async () => {
  vi.stubEnv('API_TB_HOST', tinybirdHost);
  vi.stubEnv('API_TB_TOKEN', 'test-token');
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  vi.unstubAllEnvs();
});

beforeEach(async () => {
  // The client remembers a slug's bucket for the whole process; each test counts its own lookup.
  await getTinybirdClient().clearAllBucketCaches();
  mockFetch.mockReset().mockImplementation(routeTinybird());
});

const get = (path: string) => app.inject({ method: 'GET', url: path });

describe('GET /v1-alpha/projects/{slug}/development/review-efficiency (AC1)', () => {
  it('returns the efficiency percentage, both count summaries and one bucket per granularity step', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, mergedCount: 55, extra: 'x' }],
        series: seriesRows.map((row) => ({ ...row, mergedCount: 19, platform: 'github' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<Record<string, object> & { data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(bodyKeys);
    for (const key of ['efficiencyPercentage', 'openedSummary', 'closedSummary']) {
      expect(Object.keys(body[key] ?? {}).sort()).toEqual([...summaryKeys].sort());
    }
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(bucketKeys);
    }
    expect(res.body).not.toContain('mergedCount');
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three review_efficiency calls with the slug as project and the repos', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.searchParams.get('project')).toBe('kubernetes');
      expect(call.searchParams.get('repos')).toBe(`${k8sRepo},${websiteRepo}`);
    }
  });

  it('resolves the project bucket once and sends its id on every pipe call', async () => {
    await get(url());
    const lookups = callsTo(bucketPath);
    expect(lookups).toHaveLength(1);
    expect(lookups[0]?.searchParams.get('project')).toBe('kubernetes');
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('bucketId')).toBe('7');
    }
  });

  it('treats bucket id 0 as a real bucket and forwards it', async () => {
    mockFetch.mockImplementation(routeTinybird({ bucket: [{ bucketId: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('bucketId')).toBe('0');
    }
  });

  it('sends the current range twice, once with the granularity, and the previous range once', async () => {
    await get(url());
    const ranges = pipeCalls().map((call) => [
      call.searchParams.get('startDate'),
      call.searchParams.get('endDate'),
      call.searchParams.get('granularity'),
    ]);
    expect(ranges).toHaveLength(3);
    expect(ranges).toEqual(
      expect.arrayContaining([
        [atMidnight(startDate), atMidnight(endDate), null],
        [atMidnight(startDate), atMidnight(endDate), 'monthly'],
        [atMidnight(previousStart), atMidnight(previousEnd), null],
      ]),
    );
  });

  it.each([
    ['none is sent', {}],
    ['the value is empty', { repos: '' }],
  ])('omits repos from the pipe calls when %s', async (_case, params) => {
    await get(url(params));
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.has('repos')).toBe(false);
    }
  });

  it('issues the three pipe calls concurrently', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const respond = routeTinybird();
    mockFetch.mockImplementation(async (input: unknown) => {
      if (new URL(String(input)).pathname === bucketPath) {
        return respond(input);
      }
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return respond(input);
    });
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(maxInFlight).toBe(3);
  });
});

describe('platform (AC3)', () => {
  it.each(platforms)('forwards platform=%s on all three pipe calls', async (platform) => {
    const res = await get(url({ platform }));
    expect(res.statusCode).toBe(200);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('platform')).toBe(platform);
    }
  });

  it('omits platform from the pipe calls when the caller sends none', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.has('platform')).toBe(false);
    }
  });

  // The enum is case-sensitive, as the project route's connectedPlatforms values are lowercase.
  it.each(['bitbucket', 'GitHub'])(
    'rejects platform=%s before calling Tinybird',
    async (platform) => {
      const res = await get(url({ platform }));
      expect(res.statusCode).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );
});

describe('efficiency percentage (AC4)', () => {
  it('is closed as a percentage of opened in each period, with the change in percentage points', async () => {
    const res = await get(url());
    expect(res.json().efficiencyPercentage).toEqual({
      current: 75,
      previous: 80,
      percentageChange: -6.25,
      changeValue: -5,
      ...period,
    });
  });

  // The pipe counts closed as a subset of opened, so this only pins the arithmetic as unclamped.
  it('passes the ratio through unclamped when a row reports more closed than opened', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ openedCount: 40, resolvedCount: 50 }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().efficiencyPercentage).toEqual({
      current: 125,
      previous: 80,
      percentageChange: 56.25,
      changeValue: 45,
      ...period,
    });
  });

  it('signs every summary by its direction', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ openedCount: 30, resolvedCount: 30 }] }),
    );
    const res = await get(url());
    expect(res.json()).toMatchObject({
      efficiencyPercentage: { current: 100, previous: 80, percentageChange: 25, changeValue: 20 },
      openedSummary: { current: 30, previous: 50, percentageChange: -40, changeValue: -20 },
      closedSummary: { current: 30, previous: 40, percentageChange: -25, changeValue: -10 },
    });
  });

  it('is null for the current period when nothing was opened, keeping the previous value and nulling the change', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ openedCount: 0, resolvedCount: 5 }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      efficiencyPercentage: { ...nullEfficiency, previous: 80 },
      openedSummary: { current: 0, previous: 50, percentageChange: -100, changeValue: -50 },
      closedSummary: { current: 5, previous: 40, percentageChange: -87.5, changeValue: -35 },
    });
  });

  it('is null for the previous period when nothing was opened there, keeping the current value', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ openedCount: 0, resolvedCount: 0 }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      efficiencyPercentage: { ...nullEfficiency, current: 75 },
      openedSummary: { current: 80, previous: 0, percentageChange: null, changeValue: 80 },
      closedSummary: { current: 60, previous: 0, percentageChange: null, changeValue: 60 },
    });
  });

  it('is null in both periods when neither opened a pull request', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ openedCount: 0, resolvedCount: 0 }],
        previous: [{ openedCount: 0, resolvedCount: 0 }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      efficiencyPercentage: nullEfficiency,
      openedSummary: zeroSummary,
      closedSummary: zeroSummary,
    });
  });

  it('nulls percentageChange when the previous efficiency is 0 and the current one is not', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ openedCount: 50, resolvedCount: 0 }] }),
    );
    const res = await get(url());
    expect(res.json().efficiencyPercentage).toEqual({
      current: 75,
      previous: 0,
      percentageChange: null,
      changeValue: 75,
      ...period,
    });
  });

  it('reports 0 efficiency with a 0 change when pull requests were opened but none closed in either period', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ openedCount: 80, resolvedCount: 0 }],
        previous: [{ openedCount: 50, resolvedCount: 0 }],
      }),
    );
    const res = await get(url());
    expect(res.json().efficiencyPercentage).toEqual(zeroSummary);
  });
});

describe('empty results (AC5)', () => {
  it('returns zero counts, a null efficiency and an empty series when the pipe has no rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [], previous: [], series: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
  });

  it('treats a summary row without counts as a period without pull requests', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [{}] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      efficiencyPercentage: { ...nullEfficiency, previous: 80 },
      openedSummary: { current: 0, previous: 50 },
      closedSummary: { current: 0, previous: 40 },
    });
  });

  // The pipe types both bucket bounds Nullable(Date); a null must never reach the formatter.
  it('drops a series row with a null bucket bound instead of formatting it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: null, endDate: null, openedCount: 5, resolvedCount: 1 },
          { startDate: '2025-01-01', endDate: '2025-01-31', openedCount: 30, resolvedCount: 20 },
          { startDate: '2025-02-01', endDate: null, openedCount: 9, resolvedCount: 2 },
          { startDate: null, endDate: '2025-03-31', openedCount: 4, resolvedCount: 3 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), opened: 30, closed: 20 },
    ]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });

  it('reports 0 opened and 0 closed for a bucket row without counts', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), opened: 0, closed: 0 },
    ]);
  });
});

describe('unknown slug (AC6)', () => {
  beforeEach(() => {
    // The Tinybird client warns about the missing bucket; keep the test output readable.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with a null efficiency, zero counts and an empty series after only the bucket lookup', async () => {
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(callsTo(bucketPath)[0]?.searchParams.get('project')).toBe('no-such-project');
    expect(pipeCalls()).toHaveLength(0);
  });
});

describe('request validation (AC7)', () => {
  it('rejects a timestamp in startDate', async () => {
    const res = await get(url({ startDate: '2025-01-01T00:00:00Z' }));
    expect(res.statusCode).toBe(400);
  });

  it('rejects an inverted range with invalid_request before calling Tinybird', async () => {
    const res = await get(url({ startDate: endDate, endDate: startDate }));
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('invalid_request');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects a missing granularity', async () => {
    const res = await get(url({ granularity: undefined }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects granularity=hourly', async () => {
    const res = await get(url({ granularity: 'hourly' }));
    expect(res.statusCode).toBe(400);
  });

  it('accepts an unknown query key and leaves it out of the pipe calls', async () => {
    const res = await get(url({ metric: 'review-efficiency' }));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.has('metric')).toBe(false);
    }
  });

  it('defaults the range to 2010-01-01 through today when both dates are omitted', async () => {
    // Only Date is faked, so the Tinybird client's real timers keep running and the request
    // cannot straddle a UTC midnight between the handler and the assertion.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2025-09-21T12:00:00Z'));
    try {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      expect(res.json().efficiencyPercentage).toMatchObject({
        periodFrom: isoDay('2010-01-01'),
        periodTo: isoDay('2025-09-21'),
      });
      const series = pipeCalls().find((call) => call.searchParams.has('granularity'));
      expect(series?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
      expect(series?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('Tinybird failures (AC8)', () => {
  const upstreamDetail = 'tinybird internal detail';
  // Fails only the calls to `path`; every other Tinybird call answers normally.
  const failing = (respondWith: () => Response | Promise<Response>, path = pipePath) => {
    const respond = routeTinybird();
    return async (input: unknown) =>
      new URL(String(input)).pathname === path ? respondWith() : respond(input);
  };
  const httpError = (status: number, statusText: string) => () =>
    new Response(upstreamDetail, { status, statusText });
  const networkError = () => Promise.reject(new TypeError(`fetch failed: ${upstreamDetail}`));

  beforeEach(() => {
    // The Tinybird client logs every failed request; keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 404 is in the table because the empty-data answer comes from the handler's null bucket id;
  // a 404 from the pipe itself is an outage.
  it.each([
    [500, 'Internal Server Error'],
    [404, 'Not Found'],
    [401, 'Unauthorized'],
    [429, 'Too Many Requests'],
  ])('maps a pipe %i to 503 upstream_unavailable', async (status, statusText) => {
    mockFetch.mockImplementation(failing(httpError(status, statusText)));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a failing bucket lookup to 503 upstream_unavailable without calling the pipe', async () => {
    mockFetch.mockImplementation(failing(httpError(500, 'Internal Server Error'), bucketPath));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
    expect(pipeCalls()).toHaveLength(0);
  });

  it('maps a pipe network error to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(failing(networkError));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
    // The client retries a network error, so only the path matters: the lookup succeeded and
    // the failure came from the pipe.
    expect(pipeCalls()).not.toHaveLength(0);
  });

  it('maps a bucket lookup network error to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(failing(networkError, bucketPath));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
    expect(pipeCalls()).toHaveLength(0);
  });

  it('maps a pipe response that is not JSON to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(failing(() => new Response('<html>oops</html>', { status: 200 })));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('oops');
  });

  // fetchPipe's default validator accepts a null element. Unguarded, a null series row makes
  // hasBucketBounds throw outside the 503 mapping and a null summary row reads as zero counts.
  it.each([
    ['series', { series: [null] }],
    ['current summary', { current: [null] }],
    ['previous summary', { previous: [null] }],
  ])('maps a null %s row to 503 upstream_unavailable', async (_kind, rows) => {
    mockFetch.mockImplementation(routeTinybird(rows as unknown as PipeRows));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('startDate');
  });

  // The pipe's counts are count() results, so a present count that is not a nonnegative safe
  // integer, or an array in place of a row, is a malformed body.
  it.each([
    ['an array in place of a row', { current: [[]] }],
    ['a string count', { current: [{ openedCount: '80', resolvedCount: 60 }] }],
    ['a negative count', { previous: [{ openedCount: 50, resolvedCount: -1 }] }],
    [
      'a fractional count',
      { series: [{ startDate: '2025-01-01', endDate: '2025-01-31', openedCount: 1.5 }] },
    ],
  ])('maps %s to 503 upstream_unavailable', async (_kind, rows) => {
    mockFetch.mockImplementation(routeTinybird(rows as unknown as PipeRows));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
  });
});

describe('caching headers (AC9)', () => {
  it('sets Cache-Control: private, max-age=0 on a successful response', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('sets the same header on a 503', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValue(new TypeError('fetch failed'));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
    vi.restoreAllMocks();
  });
});

describe('OpenAPI (AC10)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[specPath]?.get;
  }
  const unitOf = (schema?: OpenApiSchema) => schema?.description?.match(/\(([a-z ]+)\)\./)?.[1];

  it('lists the route in /v1-alpha/openapi.json tagged Development with a description', async () => {
    const operation = await getOperation();
    expect(operation?.tags).toEqual(['Development']);
    expect(operation?.description).toBeTruthy();
  });

  it('documents every field of the 200 response, with integer counts in the buckets', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    expect(schema?.required).toEqual(expect.arrayContaining(bodyKeys));
    for (const field of bodyKeys) {
      expect(schema?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    const bucket = schema?.properties?.data?.items;
    expect(bucket?.required).toEqual(expect.arrayContaining(bucketKeys));
    for (const field of bucketKeys) {
      expect(bucket?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    expect(bucket?.properties?.opened?.type).toBe('integer');
    expect(bucket?.properties?.closed?.type).toBe('integer');
  });

  it('documents the efficiency as nullable percent values with the change in percentage points', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const efficiency = schema?.properties?.efficiencyPercentage;
    expect(efficiency?.required).toEqual(expect.arrayContaining(summaryKeys));
    for (const field of summaryKeys) {
      expect(
        efficiency?.properties?.[field]?.description,
        `efficiencyPercentage.${field} has no description`,
      ).toBeTruthy();
    }
    for (const field of ['current', 'previous', 'changeValue', 'percentageChange']) {
      expect(efficiency?.properties?.[field], `efficiencyPercentage.${field}`).toMatchObject({
        type: 'number',
        nullable: true,
      });
    }
    expect(unitOf(efficiency?.properties?.current)).toBe('percent');
    expect(unitOf(efficiency?.properties?.previous)).toBe('percent');
    expect(unitOf(efficiency?.properties?.changeValue)).toBe('percentage points');
    expect(efficiency?.properties?.current?.description).toMatch(/null/i);
  });

  it.each(['openedSummary', 'closedSummary'])('documents %s as integer counts', async (field) => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const summary = schema?.properties?.[field];
    expect(summary?.required).toEqual(expect.arrayContaining(summaryKeys));
    for (const key of summaryKeys) {
      expect(
        summary?.properties?.[key]?.description,
        `${field}.${key} has no description`,
      ).toBeTruthy();
    }
    for (const key of ['current', 'previous', 'changeValue']) {
      expect(summary?.properties?.[key]?.type, `${field}.${key}`).toBe('integer');
      expect(unitOf(summary?.properties?.[key]), `${field}.${key}`).toBe('count');
    }
    expect(summary?.properties?.percentageChange).toMatchObject({
      type: 'number',
      nullable: true,
    });
  });

  it('documents the query params, with granularity required and platform an optional enum', async () => {
    const operation = await getOperation();
    // The operation also lists the slug path parameter; only the query params are under test.
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual([
      'endDate',
      'granularity',
      'platform',
      'repos',
      'startDate',
    ]);
    const granularity = params.get('granularity');
    expect(granularity?.required).toBe(true);
    expect(granularity?.schema.enum).toEqual(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
    const platform = params.get('platform');
    expect(platform?.required).toBeFalsy();
    expect(platform?.schema.enum).toEqual(platforms);
    expect(platform?.description ?? platform?.schema.description).toMatch(/connectedPlatforms/);
  });

  // The ticket asks for the percent reshape and the platform coverage to be documented; the
  // operation description is the docs entry.
  it('states the ratio-to-percent reshape, the null rule and what an omitted platform covers', async () => {
    const operation = await getOperation();
    expect(operation?.description).toMatch(/percent/);
    expect(operation?.description).toMatch(/null/i);
    expect(operation?.description).toMatch(/platform/);
    expect(operation?.description).toMatch(/00:00 UTC/);
  });

  it('keeps the route out of /v1', async () => {
    const spec = await get('/v1/openapi.json');
    expect(Object.keys(spec.json<OpenApiDoc>().paths)).not.toContain(
      '/v1/projects/{slug}/development/review-efficiency',
    );
    const res = await get(
      '/v1/projects/kubernetes/development/review-efficiency?granularity=monthly',
    );
    expect(res.statusCode).toBe(404);
  });
});
