// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { getTinybirdClient } from '../src/clients/tinybird.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const pipePath = '/v0/pipes/patchsets_per_review.json';
const bucketPath = '/v0/pipes/project_buckets.json';
const specPath = '/v1-alpha/projects/{slug}/development/patchsets-per-review';

const startDate = '2025-01-01';
const endDate = '2025-03-31';
// getPreviousDates shifts the range back by its calendar span (2 months 30 days here), ending
// the day before startDate.
const previousStart = '2024-10-01';
const previousEnd = '2024-12-31';
const atMidnight = (day: string) => `${day} 00:00:00`;
const isoDay = (day: string) => `${day}T00:00:00Z`;

const commonRepo = 'https://gerrit.onap.org/r/aai/common';
const schemaRepo = 'https://gerrit.onap.org/r/aai/schema-service';

// The summary node answers one row of a Nullable(Float64); the series node LEFT JOINs onto a
// generated timeseries, so a bucket without changesets is present with 0.
const currentRow = { patchsetsPerReview: 2.5 };
const previousRow = { patchsetsPerReview: 2 };
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', patchsetsPerReview: 3 },
  { startDate: '2025-02-01', endDate: '2025-02-28', patchsetsPerReview: 0 },
  { startDate: '2025-03-01', endDate: '2025-03-31', patchsetsPerReview: 2.5 },
];

const period = { periodFrom: isoDay(startDate), periodTo: isoDay(endDate) };
const expectedData = [
  { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), value: 3 },
  { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), value: 0 },
  { startDate: isoDay('2025-03-01'), endDate: isoDay('2025-03-31'), value: 2.5 },
];
const expectedBody = {
  summary: { current: 2.5, previous: 2, percentageChange: 25, changeValue: 0.5, ...period },
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

const summaryKeys = [
  'current',
  'previous',
  'percentageChange',
  'changeValue',
  'periodFrom',
  'periodTo',
];

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

function url(params: Record<string, string | string[] | undefined> = {}, slug = 'onap') {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...defaultQuery, ...params })) {
    for (const item of [value].flat()) {
      if (item !== undefined) {
        search.append(key, item);
      }
    }
  }
  return `/v1-alpha/projects/${slug}/development/patchsets-per-review?${search}`;
}

interface OpenApiSchema {
  type?: string;
  nullable?: boolean;
  description?: string;
  default?: unknown;
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

describe('GET /v1-alpha/projects/{slug}/development/patchsets-per-review (AC1)', () => {
  it('returns the patchsets summary and one value per granularity step', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it("returns only the documented keys, dropping extra pipe fields and Nuxt's median and average", async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, median: 9, average: 9, extra: 'x' }],
        series: seriesRows.map((row) => ({ ...row, median: 9, average: 9, extra: 'x' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ summary: object; data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'summary']);
    expect(Object.keys(body.summary).sort()).toEqual([...summaryKeys].sort());
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(['endDate', 'startDate', 'value']);
    }
    expect(res.body).not.toContain('"median"');
    expect(res.body).not.toContain('"average"');
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three patchsets_per_review calls with the slug as project, the repos and the bucket id from one lookup', async () => {
    await get(url({ repos: [commonRepo, schemaRepo] }));
    const lookups = callsTo(bucketPath);
    expect(lookups).toHaveLength(1);
    expect(lookups[0]?.searchParams.get('project')).toBe('onap');
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.searchParams.get('project')).toBe('onap');
      expect(call.searchParams.get('bucketId')).toBe('7');
      expect(call.searchParams.get('repos')).toBe(`${commonRepo},${schemaRepo}`);
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

describe('stat (AC3)', () => {
  it('sends dataType=median on every pipe call when stat is omitted', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('dataType')).toBe('median');
    }
  });

  it('sends dataType=average on every pipe call for stat=average', async () => {
    const res = await get(url({ stat: 'average' }));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('dataType')).toBe('average');
    }
  });

  it.each(['mean', 'Median', ''])('rejects stat=%s before calling Tinybird', async (stat) => {
    const res = await get(url({ stat }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Nuxt's name for the parameter is an unknown key here: accepted and ignored like any other.
  it('ignores a dataType query key and still sends dataType=median', async () => {
    const res = await get(url({ dataType: 'average' }));
    expect(res.statusCode).toBe(200);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('dataType')).toBe('median');
    }
  });
});

describe('periods without changesets (AC4)', () => {
  it('keeps the previous value and nulls the change when the current value is null', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [{ patchsetsPerReview: null }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: { ...nullSummary, previous: 2 },
      data: expectedData,
    });
  });

  it('keeps the current value and nulls the change when the previous value is null', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ patchsetsPerReview: null }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, current: 2.5 });
  });

  it('nulls every value when neither period has changesets', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ patchsetsPerReview: null }],
        previous: [{ patchsetsPerReview: null }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual(nullSummary);
  });

  it('treats an empty current result as a period without changesets', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, previous: 2 });
  });

  it('treats an empty previous result as a comparison period without changesets', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, current: 2.5 });
  });
});

describe('percentageChange (AC5)', () => {
  it('is negative when the current period needs fewer patchsets', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ patchsetsPerReview: 2 }],
        previous: [{ patchsetsPerReview: 4 }],
      }),
    );
    const res = await get(url());
    expect(res.json().summary).toMatchObject({
      current: 2,
      previous: 4,
      percentageChange: -50,
      changeValue: -2,
    });
  });

  it('is null when the previous value is 0 and the current one is not', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ patchsetsPerReview: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({
      current: 2.5,
      previous: 0,
      percentageChange: null,
      changeValue: 2.5,
    });
  });
});

describe('series buckets (AC6)', () => {
  it("keeps the pipe's 0 for a bucket without changesets", async () => {
    const res = await get(url());
    expect(res.json().data[1]).toEqual(expectedData[1]);
  });

  it('reports 0 for a bucket row without a patchsetsPerReview', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), value: 0 },
    ]);
  });

  // The generated timeseries types both bucket bounds Nullable(Date); a null must never reach
  // the formatter.
  it('drops a series row with a null bucket bound instead of formatting it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: null, endDate: null, patchsetsPerReview: 5 },
          { startDate: '2025-01-01', endDate: '2025-01-31', patchsetsPerReview: 3 },
          { startDate: '2025-02-01', endDate: null, patchsetsPerReview: 9 },
          { startDate: null, endDate: '2025-03-31', patchsetsPerReview: 4 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), value: 3 },
    ]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });

  it('returns an empty data list with the summary when the series has no rows', async () => {
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

  it('returns 200 with a null summary and no buckets after only the bucket lookup', async () => {
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

  it('rejects a missing granularity', async () => {
    const res = await get(url({ granularity: undefined }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects granularity=hourly', async () => {
    const res = await get(url({ granularity: 'hourly' }));
    expect(res.statusCode).toBe(400);
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

  it('lists the route tagged Development and states that the data is Gerrit only', async () => {
    const operation = await getOperation();
    expect(operation?.tags).toEqual(['Development']);
    expect(operation?.description).toMatch(/Gerrit/);
    expect(operation?.description).toMatch(/00:00 UTC/);
  });

  it('documents every field of the 200 response with nullable summary values', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    expect(schema?.required).toEqual(expect.arrayContaining(['summary', 'data']));
    for (const field of ['summary', 'data']) {
      expect(schema?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    const bucket = schema?.properties?.data?.items;
    const bucketFields = ['startDate', 'endDate', 'value'];
    expect(bucket?.required).toEqual(expect.arrayContaining(bucketFields));
    for (const field of bucketFields) {
      expect(bucket?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    expect(bucket?.properties?.value?.type).toBe('number');
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
    expect(summary?.properties?.current?.description).toContain('(patchsets per review)');
  });

  it('documents the query params, with granularity required and stat an enum defaulting to median', async () => {
    const operation = await getOperation();
    // The operation also lists the slug path parameter; only the query params are under test.
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual(
      ['endDate', 'granularity', 'repos', 'startDate', 'stat'].sort(),
    );
    const granularity = params.get('granularity');
    expect(granularity?.required).toBe(true);
    expect(granularity?.schema.enum).toEqual(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
    expect(granularity?.description ?? granularity?.schema.description).toBeTruthy();
    const stat = params.get('stat');
    expect(stat?.required).toBeFalsy();
    expect(stat?.schema).toMatchObject({
      type: 'string',
      enum: ['median', 'average'],
      default: 'median',
    });
    expect(stat?.description ?? stat?.schema.description).toBeTruthy();
  });

  it('keeps the route out of /v1', async () => {
    const spec = await get('/v1/openapi.json');
    expect(Object.keys(spec.json<OpenApiDoc>().paths)).not.toContain(
      '/v1/projects/{slug}/development/patchsets-per-review',
    );
    const res = await get('/v1/projects/onap/development/patchsets-per-review?granularity=monthly');
    expect(res.statusCode).toBe(404);
  });
});
