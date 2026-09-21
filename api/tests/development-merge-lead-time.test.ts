// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { getTinybirdClient } from '../src/clients/tinybird.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const pipePath = '/v0/pipes/pull_requests_merge_lead_time.json';
const bucketPath = '/v0/pipes/project_buckets.json';
const specPath = '/v1-alpha/projects/{slug}/development/merge-lead-time';

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

// The pipe answers one row of five Nullable(Float64) averages. approvedToMerged is null in the
// current row so the default fixture already exercises a stage without data.
const currentRow = {
  openedToMergedSeconds: 300000,
  openedToReviewAssignedSeconds: 30000,
  reviewAssignedToFirstReviewSeconds: 90000,
  firstReviewToApprovedSeconds: 30000,
  approvedToMergedSeconds: null,
};
const previousRow = {
  openedToMergedSeconds: 240000,
  openedToReviewAssignedSeconds: 20000,
  reviewAssignedToFirstReviewSeconds: 120000,
  firstReviewToApprovedSeconds: 30000,
  approvedToMergedSeconds: 80000,
};

const period = { periodFrom: isoDay(startDate), periodTo: isoDay(endDate) };
const stageKeys = ['summary', 'pickupSeconds', 'reviewSeconds', 'acceptedSeconds', 'mergedSeconds'];
const summaryKeys = [
  'current',
  'previous',
  'percentageChange',
  'changeValue',
  'periodFrom',
  'periodTo',
];

const expectedBody = {
  summary: {
    current: 300000,
    previous: 240000,
    percentageChange: 25,
    changeValue: 60000,
    ...period,
  },
  pickupSeconds: {
    current: 30000,
    previous: 20000,
    percentageChange: 50,
    changeValue: 10000,
    ...period,
  },
  reviewSeconds: {
    current: 90000,
    previous: 120000,
    percentageChange: -25,
    changeValue: -30000,
    ...period,
  },
  acceptedSeconds: {
    current: 30000,
    previous: 30000,
    percentageChange: 0,
    changeValue: 0,
    ...period,
  },
  mergedSeconds: {
    current: null,
    previous: 80000,
    percentageChange: null,
    changeValue: null,
    ...period,
  },
};

const nullSummary = {
  current: null,
  previous: null,
  percentageChange: null,
  changeValue: null,
  ...period,
};
const nullBody = {
  summary: nullSummary,
  pickupSeconds: nullSummary,
  reviewSeconds: nullSummary,
  acceptedSeconds: nullSummary,
  mergedSeconds: nullSummary,
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
}

// The handler resolves the slug to a bucket once, then makes the two pipe calls, which differ
// only by their date range.
const routeTinybird =
  ({
    bucket = [{ bucketId: 7 }],
    current = [currentRow],
    previous = [previousRow],
  }: PipeRows = {}) =>
  async (input: unknown) => {
    const url = new URL(String(input));
    if (url.pathname === bucketPath) {
      return tinybirdResponse(bucket);
    }
    const isPrevious = url.searchParams.get('startDate') === atMidnight(previousStart);
    return tinybirdResponse(isPrevious ? previous : current);
  };

const callsTo = (path: string) =>
  mockFetch.mock.calls
    .map((call) => new URL(String(call[0])))
    .filter((url) => url.pathname === path);
const pipeCalls = () => callsTo(pipePath);

const defaultQuery = { startDate, endDate };

function url(params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...defaultQuery, ...params })) {
    for (const item of [value].flat()) {
      if (item !== undefined) {
        search.append(key, item);
      }
    }
  }
  return `/v1-alpha/projects/${slug}/development/merge-lead-time?${search}`;
}

interface OpenApiSchema {
  type?: string;
  nullable?: boolean;
  description?: string;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
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

describe('GET /v1-alpha/projects/{slug}/development/merge-lead-time (AC1)', () => {
  it('returns the lead time summary and the four stages from the current and previous rows', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, unit: 'seconds', changeType: 'positive', extra: 'x' }],
        previous: [{ ...previousRow, extra: 'x' }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<Record<string, object>>();
    expect(Object.keys(body).sort()).toEqual([...stageKeys].sort());
    for (const key of stageKeys) {
      expect(Object.keys(body[key] ?? {}).sort()).toEqual([...summaryKeys].sort());
    }
    expect(res.body).not.toContain('changeType');
    expect(res.body).not.toContain('"unit"');
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes two pipe calls with the slug as project, the repos and the bucket id from one lookup', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    const lookups = callsTo(bucketPath);
    expect(lookups).toHaveLength(1);
    expect(lookups[0]?.searchParams.get('project')).toBe('kubernetes');
    const calls = pipeCalls();
    expect(calls).toHaveLength(2);
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
    expect(calls).toHaveLength(2);
    for (const call of calls) {
      expect(call.searchParams.get('bucketId')).toBe('0');
    }
  });

  it('sends the current range on one call and the previous range on the other, without a granularity', async () => {
    await get(url());
    const ranges = pipeCalls().map((call) => [
      call.searchParams.get('startDate'),
      call.searchParams.get('endDate'),
    ]);
    expect(ranges).toHaveLength(2);
    expect(ranges).toEqual(
      expect.arrayContaining([
        [atMidnight(startDate), atMidnight(endDate)],
        [atMidnight(previousStart), atMidnight(previousEnd)],
      ]),
    );
    for (const call of pipeCalls()) {
      expect(call.searchParams.has('granularity')).toBe(false);
    }
  });

  it.each([
    ['none is sent', {}],
    ['the value is empty', { repos: '' }],
  ])('omits repos from the pipe calls when %s', async (_case, params) => {
    await get(url(params));
    const calls = pipeCalls();
    expect(calls).toHaveLength(2);
    for (const call of calls) {
      expect(call.searchParams.has('repos')).toBe(false);
    }
  });

  it('issues the two pipe calls concurrently', async () => {
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
    expect(maxInFlight).toBe(2);
  });
});

describe('stages without data (AC3)', () => {
  it('keeps the previous value and nulls the change when the current stage value is null', async () => {
    const res = await get(url());
    expect(res.json().mergedSeconds).toEqual({
      current: null,
      previous: 80000,
      percentageChange: null,
      changeValue: null,
      ...period,
    });
  });

  it('keeps the current value and nulls the change when the previous stage value is null', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ ...previousRow, openedToReviewAssignedSeconds: null }] }),
    );
    const res = await get(url());
    expect(res.json().pickupSeconds).toEqual({
      current: 30000,
      previous: null,
      percentageChange: null,
      changeValue: null,
      ...period,
    });
  });

  it('nulls a stage entirely when neither period has data for it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, reviewAssignedToFirstReviewSeconds: null }],
        previous: [{ ...previousRow, reviewAssignedToFirstReviewSeconds: null }],
      }),
    );
    const res = await get(url());
    expect(res.json().reviewSeconds).toEqual(nullSummary);
  });

  it('applies the same null rules to summary', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ ...currentRow, openedToMergedSeconds: null }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({
      current: null,
      previous: 240000,
      percentageChange: null,
      changeValue: null,
      ...period,
    });
  });

  it('treats an empty pipe result as a period without data', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: { ...nullSummary, previous: 240000 },
      pickupSeconds: { ...nullSummary, previous: 20000 },
      reviewSeconds: { ...nullSummary, previous: 120000 },
      acceptedSeconds: { ...nullSummary, previous: 30000 },
      mergedSeconds: { ...nullSummary, previous: 80000 },
    });
  });

  it('treats an empty previous result as a comparison period without data', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: { ...nullSummary, current: 300000 },
      pickupSeconds: { ...nullSummary, current: 30000 },
      reviewSeconds: { ...nullSummary, current: 90000 },
      acceptedSeconds: { ...nullSummary, current: 30000 },
      mergedSeconds: nullSummary,
    });
  });

  it('returns every value null when neither call has rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [], previous: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(nullBody);
  });

  it('returns every value null when both rows are all nulls', async () => {
    const nullRow = Object.fromEntries(Object.keys(currentRow).map((key) => [key, null]));
    mockFetch.mockImplementation(routeTinybird({ current: [nullRow], previous: [nullRow] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(nullBody);
  });
});

describe('percentageChange (AC4)', () => {
  it('is signed, positive for a longer current period and negative for a shorter one', async () => {
    const res = await get(url());
    expect(res.json().summary).toMatchObject({ percentageChange: 25, changeValue: 60000 });
    expect(res.json().reviewSeconds).toMatchObject({ percentageChange: -25, changeValue: -30000 });
  });

  it('is null when the previous average is 0 and the current one is not', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ ...previousRow, firstReviewToApprovedSeconds: 0 }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().acceptedSeconds).toEqual({
      current: 30000,
      previous: 0,
      percentageChange: null,
      changeValue: 30000,
      ...period,
    });
  });

  it('is 0 when both averages are 0', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, firstReviewToApprovedSeconds: 0 }],
        previous: [{ ...previousRow, firstReviewToApprovedSeconds: 0 }],
      }),
    );
    const res = await get(url());
    expect(res.json().acceptedSeconds).toEqual({
      current: 0,
      previous: 0,
      percentageChange: 0,
      changeValue: 0,
      ...period,
    });
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

  it('returns 200 with every value null after only the bucket lookup when the slug has no bucket', async () => {
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(nullBody);
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
      const current = pipeCalls().find(
        (call) => call.searchParams.get('startDate') === atMidnight('2010-01-01'),
      );
      expect(current?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    } finally {
      vi.useRealTimers();
    }
  });

  it('accepts and ignores unknown query keys, granularity included', async () => {
    const res = await get(url({ granularity: 'monthly', foo: 'bar' }));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    for (const call of pipeCalls()) {
      expect(call.searchParams.has('granularity')).toBe(false);
      expect(call.searchParams.has('foo')).toBe(false);
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

  // 404 is in the table because the null answer comes from the handler's null bucket id; a 404
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

  it('lists the route in /v1-alpha/openapi.json tagged Development with a description', async () => {
    const operation = await getOperation();
    expect(operation?.tags).toEqual(['Development']);
    expect(operation?.description).toBeTruthy();
  });

  it('documents every field of the 200 response, with the seconds and the change nullable', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    expect(schema?.required).toEqual(expect.arrayContaining(stageKeys));
    for (const key of stageKeys) {
      const stage = schema?.properties?.[key];
      expect(stage?.description, `${key} has no description`).toBeTruthy();
      expect(stage?.required).toEqual(expect.arrayContaining(summaryKeys));
      for (const field of summaryKeys) {
        expect(
          stage?.properties?.[field]?.description,
          `${key}.${field} has no description`,
        ).toBeTruthy();
      }
      for (const field of ['current', 'previous', 'changeValue', 'percentageChange']) {
        expect(stage?.properties?.[field], `${key}.${field}`).toMatchObject({
          type: 'number',
          nullable: true,
        });
      }
    }
  });

  it('documents exactly the three shared query params, none required', async () => {
    const operation = await getOperation();
    // The operation also lists the slug path parameter; only the query params are under test.
    const params = operation?.parameters?.filter((param) => param.in === 'query') ?? [];
    expect(params.map((param) => param.name).sort()).toEqual(['endDate', 'repos', 'startDate']);
    for (const param of params) {
      expect(param.required).toBeFalsy();
      expect(param.description ?? param.schema.description, `${param.name}`).toBeTruthy();
    }
  });

  it('keeps the route out of /v1', async () => {
    const spec = await get('/v1/openapi.json');
    expect(Object.keys(spec.json<OpenApiDoc>().paths)).not.toContain(
      '/v1/projects/{slug}/development/merge-lead-time',
    );
    const res = await get('/v1/projects/kubernetes/development/merge-lead-time');
    expect(res.statusCode).toBe(404);
  });
});
