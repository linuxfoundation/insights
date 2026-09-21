// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { getTinybirdClient } from '../src/clients/tinybird.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const pipePath = '/v0/pipes/median_time_to_review.json';
const bucketPath = '/v0/pipes/project_buckets.json';
const specPath = '/v1-alpha/projects/{slug}/development/median-time-to-review';

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

// The summary calls answer one row of a Nullable median; the series answers one row per bucket
// with 0 where no pull request opened in the bucket was reviewed.
const currentRow = { medianTimeToReviewSeconds: 86400 };
const previousRow = { medianTimeToReviewSeconds: 115200 };
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', medianTimeToReviewSeconds: 72000 },
  { startDate: '2025-02-01', endDate: '2025-02-28', medianTimeToReviewSeconds: 0 },
  { startDate: '2025-03-01', endDate: '2025-03-31', medianTimeToReviewSeconds: 100800 },
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
const bucketKeys = ['startDate', 'endDate', 'medianTimeToReviewSeconds'];

const expectedData = [
  {
    startDate: isoDay('2025-01-01'),
    endDate: isoDay('2025-01-31'),
    medianTimeToReviewSeconds: 72000,
  },
  { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), medianTimeToReviewSeconds: 0 },
  {
    startDate: isoDay('2025-03-01'),
    endDate: isoDay('2025-03-31'),
    medianTimeToReviewSeconds: 100800,
  },
];
const expectedBody = {
  summary: {
    current: 86400,
    previous: 115200,
    percentageChange: -25,
    changeValue: -28800,
    ...period,
  },
  data: expectedData,
};

const nullSummary = {
  current: null,
  previous: null,
  percentageChange: null,
  changeValue: null,
  ...period,
};
const emptyBody = { summary: nullSummary, data: [] };

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
  return `/v1-alpha/projects/${slug}/development/median-time-to-review?${search}`;
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

describe('GET /v1-alpha/projects/{slug}/development/median-time-to-review (AC1)', () => {
  it('returns the median summary from the two summary rows and one bucket per series row', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, unit: 'seconds', extra: 'x' }],
        previous: [{ ...previousRow, extra: 'x' }],
        series: seriesRows.map((row, index) => ({ ...row, day: index + 1, extra: 'x' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ summary: object; data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'summary']);
    expect(Object.keys(body.summary).sort()).toEqual([...summaryKeys].sort());
    expect(body.data).toHaveLength(3);
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual([...bucketKeys].sort());
    }
    expect(res.body).not.toContain('extra');
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three pipe calls with the slug as project, the repos and the bucket id from one lookup', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    const lookups = callsTo(bucketPath);
    expect(lookups).toHaveLength(1);
    expect(lookups[0]?.searchParams.get('project')).toBe('kubernetes');
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.searchParams.get('project')).toBe('kubernetes');
      expect(call.searchParams.get('bucketId')).toBe('7');
      expect(call.searchParams.get('repos')).toBe(`${k8sRepo},${websiteRepo}`);
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

  it.each(['bitbucket', ''])('rejects platform=%s before calling Tinybird', async (platform) => {
    const res = await get(url({ platform }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('periods without a reviewed pull request (AC4)', () => {
  it('keeps the previous value and nulls the change when the current median is null', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [{ medianTimeToReviewSeconds: null }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, previous: 115200 });
  });

  it('keeps the current value and nulls the change when the previous median is null', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ medianTimeToReviewSeconds: null }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, current: 86400 });
  });

  it('nulls the summary entirely when neither period has a reviewed pull request', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ medianTimeToReviewSeconds: null }],
        previous: [{ medianTimeToReviewSeconds: null }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ summary: nullSummary, data: expectedData });
  });

  it('treats an empty current result as a period without data', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, previous: 115200 });
  });

  it('treats an empty previous result as a comparison period without data', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, current: 86400 });
  });

  it('returns a null summary and an empty series when no call has rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [], previous: [], series: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
  });
});

describe('percentageChange (AC5)', () => {
  it('is negative when the current median is shorter than the previous one', async () => {
    const res = await get(url());
    expect(res.json().summary).toMatchObject({ percentageChange: -25, changeValue: -28800 });
  });

  it('is positive when the current median is longer than the previous one', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ medianTimeToReviewSeconds: 129600 }],
        previous: [{ medianTimeToReviewSeconds: 86400 }],
      }),
    );
    const res = await get(url());
    expect(res.json().summary).toMatchObject({
      current: 129600,
      previous: 86400,
      percentageChange: 50,
      changeValue: 43200,
    });
  });

  it('is null when the previous median is 0 and the current one is not', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ medianTimeToReviewSeconds: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({
      current: 86400,
      previous: 0,
      percentageChange: null,
      changeValue: 86400,
      ...period,
    });
  });

  it('is 0 when both medians are 0', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ medianTimeToReviewSeconds: 0 }],
        previous: [{ medianTimeToReviewSeconds: 0 }],
      }),
    );
    const res = await get(url());
    expect(res.json().summary).toEqual({
      current: 0,
      previous: 0,
      percentageChange: 0,
      changeValue: 0,
      ...period,
    });
  });
});

describe('series buckets (AC6)', () => {
  it('passes the 0 the pipe reports for a bucket without a reviewed pull request through', async () => {
    const res = await get(url());
    expect(res.json().data[1]).toEqual(expectedData[1]);
    expect(res.json().data[1].medianTimeToReviewSeconds).toBe(0);
  });

  it('reports 0 for a bucket row without the median field', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      {
        startDate: isoDay('2025-01-01'),
        endDate: isoDay('2025-01-31'),
        medianTimeToReviewSeconds: 0,
      },
    ]);
  });

  // The bucket bounds come from a CASE without ELSE, so the pipe types them Nullable(Date); a
  // null must never reach the formatter.
  it('drops a series row with a null bucket bound instead of formatting it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: null, endDate: null, medianTimeToReviewSeconds: 5 },
          { startDate: '2025-01-01', endDate: '2025-01-31', medianTimeToReviewSeconds: 72000 },
          { startDate: '2025-02-01', endDate: null, medianTimeToReviewSeconds: 9 },
          { startDate: null, endDate: '2025-03-31', medianTimeToReviewSeconds: 4 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([expectedData[0]]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });

  it('keeps the series rows in pipe order', async () => {
    mockFetch.mockImplementation(routeTinybird({ series: [...seriesRows].reverse() }));
    const res = await get(url());
    expect(res.json().data).toEqual([...expectedData].reverse());
  });

  it('returns an empty series when the pipe has no bucket rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ series: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ summary: expectedBody.summary, data: [] });
  });
});

describe('unknown slug (AC7)', () => {
  beforeEach(() => {
    // The Tinybird client warns about the missing bucket; keep the test output readable.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with a null summary and an empty series after only the bucket lookup', async () => {
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(callsTo(bucketPath)[0]?.searchParams.get('project')).toBe('no-such-project');
    expect(pipeCalls()).toHaveLength(0);
  });
});

describe('request validation (AC8)', () => {
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

  it('rejects a missing granularity before calling Tinybird', async () => {
    const res = await get(url({ granularity: undefined }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects granularity=hourly', async () => {
    const res = await get(url({ granularity: 'hourly' }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('defaults the range to 2010-01-01 through today when both dates are omitted', async () => {
    // Only Date is faked, so the Tinybird client's real timers keep running and the request
    // cannot straddle a UTC midnight between the handler and the assertion.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2025-09-21T12:00:00Z'));
    try {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      expect(res.json().summary).toMatchObject({
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

  it('accepts and ignores unknown query keys', async () => {
    const res = await get(url({ foo: 'bar' }));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    for (const call of pipeCalls()) {
      expect(call.searchParams.has('foo')).toBe(false);
    }
  });
});

describe('Tinybird failures (AC9)', () => {
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

  // 404 is in the table because the empty answer comes from the handler's null bucket id; a 404
  // from the pipe itself is an outage.
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

  // fetchPipe only checks that `data` is an array; the row guards are what turn a row outside the
  // pipe contract into the documented 503 instead of a serializer 500.
  it.each<[string, PipeRows]>([
    [
      'a string median in the current summary',
      { current: [{ medianTimeToReviewSeconds: 'fast' }] },
    ],
    [
      'a string median in the previous summary',
      { previous: [{ medianTimeToReviewSeconds: 'fast' }] },
    ],
    ['a null current summary row', { current: [null as unknown as object] }],
    [
      'a string median in a bucket',
      {
        series: [
          { startDate: '2025-01-01', endDate: '2025-01-31', medianTimeToReviewSeconds: 'fast' },
        ],
      },
    ],
    [
      'a numeric bucket bound',
      {
        series: [{ startDate: 20250101, endDate: '2025-01-31', medianTimeToReviewSeconds: 72000 }],
      },
    ],
    [
      'a bucket row without a start bound',
      { series: [{ endDate: '2025-01-31', medianTimeToReviewSeconds: 72000 }] },
    ],
  ])('maps %s to 503 upstream_unavailable', async (_case, rows) => {
    mockFetch.mockImplementation(routeTinybird(rows));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('fast');
  });
});

describe('caching headers (AC10)', () => {
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

describe('OpenAPI (AC11)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[specPath]?.get;
  }

  it('lists the route tagged Development with a description that covers platform', async () => {
    const operation = await getOperation();
    expect(operation?.tags).toEqual(['Development']);
    expect(operation?.description).toMatch(/`platform`/);
    for (const platform of ['GitHub', 'GitLab', 'Gerrit']) {
      expect(operation?.description).toContain(platform);
    }
  });

  it('documents every field of the 200 response, with the summary values nullable and the bucket median not', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    expect(schema?.required).toEqual(expect.arrayContaining(['summary', 'data']));
    for (const field of ['summary', 'data']) {
      expect(schema?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    const summary = schema?.properties?.summary;
    expect(summary?.required).toEqual(expect.arrayContaining(summaryKeys));
    for (const field of summaryKeys) {
      expect(
        summary?.properties?.[field]?.description,
        `summary.${field} has no description`,
      ).toBeTruthy();
    }
    for (const field of ['current', 'previous', 'changeValue', 'percentageChange']) {
      expect(summary?.properties?.[field], `summary.${field}`).toMatchObject({
        type: 'number',
        nullable: true,
      });
    }
    const bucket = schema?.properties?.data?.items;
    expect(bucket?.required).toEqual(expect.arrayContaining(bucketKeys));
    for (const field of bucketKeys) {
      expect(bucket?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    expect(bucket?.properties?.medianTimeToReviewSeconds?.type).toBe('number');
    expect(bucket?.properties?.medianTimeToReviewSeconds?.nullable).toBeUndefined();
  });

  it('documents the query params, with granularity required and platform an optional enum', async () => {
    const operation = await getOperation();
    // The operation also lists the slug path parameter; only the query params are under test.
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual(
      ['endDate', 'granularity', 'platform', 'repos', 'startDate'].sort(),
    );
    const granularity = params.get('granularity');
    expect(granularity?.required).toBe(true);
    expect(granularity?.schema.enum).toEqual(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
    const platform = params.get('platform');
    expect(platform?.required).toBeFalsy();
    expect(platform?.schema).toMatchObject({ type: 'string', enum: platforms });
    expect(platform?.description ?? platform?.schema.description).toBeTruthy();
  });

  it('keeps the route out of /v1', async () => {
    const spec = await get('/v1/openapi.json');
    expect(Object.keys(spec.json<OpenApiDoc>().paths)).not.toContain(
      '/v1/projects/{slug}/development/median-time-to-review',
    );
    const res = await get(
      '/v1/projects/kubernetes/development/median-time-to-review?granularity=monthly',
    );
    expect(res.statusCode).toBe(404);
  });
});
