// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildApp } from '../src/app.js';
import { getTinybirdClient } from '../src/clients/tinybird.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const pipePath = '/v0/pipes/activities_count.json';
const bucketPath = '/v0/pipes/project_buckets.json';
const specPath = '/v1-alpha/projects/{slug}/development/code-reviews';

// The Nuxt code-reviews branch of code-review-engagement filters on these five types, in this order.
const codeReviewTypes = [
  'pull_request-reviewed',
  'merge_request-review-changes-requested',
  'merge_request-review-approved',
  'changeset_comment-created',
  'patchset_comment-created',
];

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

const currentRow = { activityCount: 1280 };
const previousRow = { activityCount: 1024 };
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', activityCount: 470 },
  { startDate: '2025-02-01', endDate: '2025-02-28', activityCount: 390 },
  { startDate: '2025-03-01', endDate: '2025-03-31', activityCount: 420 },
];

const expectedBody = {
  summary: {
    current: 1280,
    previous: 1024,
    percentageChange: 25,
    changeValue: 256,
    periodFrom: isoDay(startDate),
    periodTo: isoDay(endDate),
  },
  data: [
    { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), reviews: 470 },
    { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), reviews: 390 },
    { startDate: isoDay('2025-03-01'), endDate: isoDay('2025-03-31'), reviews: 420 },
  ],
};

const zeroBody = {
  summary: {
    current: 0,
    previous: 0,
    percentageChange: 0,
    changeValue: 0,
    periodFrom: isoDay(startDate),
    periodTo: isoDay(endDate),
  },
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
  return `/v1-alpha/projects/${slug}/development/code-reviews?${search}`;
}

interface OpenApiSchema {
  type?: string;
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

describe('GET /v1-alpha/projects/{slug}/development/code-reviews (AC1)', () => {
  it('returns the code reviews summary and one bucket per granularity step', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, extra: 'x' }],
        series: seriesRows.map((row) => ({ ...row, activityType: 'pull_request-reviewed' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'summary']);
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(['endDate', 'reviews', 'startDate']);
    }
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three activities_count calls with the slug as project, the repos and the five code review types', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.searchParams.get('project')).toBe('kubernetes');
      expect(call.searchParams.get('repos')).toBe(`${k8sRepo},${websiteRepo}`);
      expect(call.searchParams.get('activity_types')).toBe(codeReviewTypes.join(','));
    }
  });

  // The Nuxt code-reviews branch sends none of these, so the pipe applies its own defaults; sending
  // them here could change the count against the widget.
  it('sends neither the contribution flags nor a singular activity_type', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      for (const key of [
        'activity_type',
        'onlyContributions',
        'includeCodeContributions',
        'includeCollaborations',
      ]) {
        expect(call.searchParams.has(key), `${key} was sent`).toBe(false);
      }
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

  it('omits repos from the pipe calls when the caller sends none', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.has('repos')).toBe(false);
    }
  });

  it('drops an empty repos value instead of sending it to the pipe as a filter', async () => {
    await get(url({ repos: '' }));
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

describe('percentageChange (AC3)', () => {
  it('is negative when the current period has fewer reviews', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ activityCount: 50 }], previous: [{ activityCount: 100 }] }),
    );
    const res = await get(url());
    expect(res.json().summary).toMatchObject({
      current: 50,
      previous: 100,
      percentageChange: -50,
      changeValue: -50,
    });
  });

  it('is null when the previous period had no reviews and the current one has some', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ activityCount: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({
      current: 1280,
      previous: 0,
      percentageChange: null,
    });
  });
});

describe('empty results (AC4)', () => {
  it('returns zeros and an empty series when the pipe has no rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [], previous: [], series: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(zeroBody);
  });

  // The pipe types both bucket bounds Nullable(Date); a null must never reach the formatter.
  it('drops a series row with a null bucket bound instead of formatting it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: null, endDate: null, activityCount: 5 },
          { startDate: '2025-01-01', endDate: '2025-01-31', activityCount: 470 },
          { startDate: '2025-02-01', endDate: null, activityCount: 9 },
          { startDate: null, endDate: '2025-03-31', activityCount: 4 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), reviews: 470 },
    ]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });

  it('reports 0 reviews for a bucket row without an activityCount', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), reviews: 0 },
    ]);
  });
});

describe('unknown slug (AC5)', () => {
  beforeEach(() => {
    // The Tinybird client warns about the missing bucket; keep the test output readable.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with zeros after only the bucket lookup when the slug has no bucket', async () => {
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(zeroBody);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(callsTo(bucketPath)[0]?.searchParams.get('project')).toBe('no-such-project');
    expect(pipeCalls()).toHaveLength(0);
  });
});

describe('request validation (AC6)', () => {
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

  // The Nuxt handler took a metric= selector; here the metric is the path, so the key is noise.
  it('accepts an unknown query key and leaves it out of the pipe calls', async () => {
    const res = await get(url({ metric: 'code-reviews' }));
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
});

describe('Tinybird failures (AC7)', () => {
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
});

describe('caching headers (AC8)', () => {
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

describe('OpenAPI (AC9)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[specPath]?.get;
  }

  it('lists the route in /v1-alpha/openapi.json tagged Development', async () => {
    const operation = await getOperation();
    expect(operation?.tags).toEqual(['Development']);
  });

  it('documents every field of the 200 response, with the counts as integers', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const fields = ['summary', 'data'];
    expect(schema?.required).toEqual(expect.arrayContaining(fields));
    for (const field of fields) {
      expect(schema?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    const bucket = schema?.properties?.data?.items;
    const bucketFields = ['startDate', 'endDate', 'reviews'];
    expect(bucket?.required).toEqual(expect.arrayContaining(bucketFields));
    for (const field of bucketFields) {
      expect(bucket?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    expect(bucket?.properties?.reviews?.type).toBe('integer');
    const summary = schema?.properties?.summary;
    const summaryFields = [
      'current',
      'previous',
      'percentageChange',
      'changeValue',
      'periodFrom',
      'periodTo',
    ];
    expect(summary?.required).toEqual(expect.arrayContaining(summaryFields));
    for (const field of summaryFields) {
      expect(
        summary?.properties?.[field]?.description,
        `summary.${field} has no description`,
      ).toBeTruthy();
    }
    expect(summary?.properties?.current?.type).toBe('integer');
  });

  it('documents the query params, with granularity required', async () => {
    const operation = await getOperation();
    // The operation also lists the slug path parameter; only the query params are under test.
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual(['endDate', 'granularity', 'repos', 'startDate']);
    const granularity = params.get('granularity');
    expect(granularity?.required).toBe(true);
    expect(granularity?.schema.enum).toEqual(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
    expect(granularity?.description ?? granularity?.schema.description).toBeTruthy();
  });

  // The ticket asks for the counted activity types and the overlap with review-comments to be
  // documented; the operation description is the docs entry.
  it('names the five code review activity types and the overlap with review-comments', async () => {
    const operation = await getOperation();
    for (const type of codeReviewTypes) {
      expect(operation?.description, `description omits ${type}`).toContain(type);
    }
    expect(operation?.description).toContain('review-comments');
  });

  it('keeps the route out of /v1', async () => {
    const spec = await get('/v1/openapi.json');
    expect(Object.keys(spec.json<OpenApiDoc>().paths)).not.toContain(
      '/v1/projects/{slug}/development/code-reviews',
    );
    const res = await get('/v1/projects/kubernetes/development/code-reviews?granularity=monthly');
    expect(res.statusCode).toBe(404);
  });
});
