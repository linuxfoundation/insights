// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { getTinybirdClient } from '../src/clients/tinybird.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const pipePath = '/v0/pipes/pull_requests_review_time_by_size.json';
const bucketPath = '/v0/pipes/project_buckets.json';
const specPath = '/v1-alpha/projects/{slug}/development/review-time-by-pr-size';

const startDate = '2025-01-01';
const endDate = '2025-03-31';
const atMidnight = (day: string) => `${day} 00:00:00`;

const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';

// The rows of the Nuxt mock, in the order the pipe returns them: ascending size, which differs
// from the alphabetical order of the labels.
const pipeRows = [
  { gitChangedLinesBucket: '1-9', reviewedInSecondsAvg: 34017, pullRequestCount: 5 },
  { gitChangedLinesBucket: '10-59', reviewedInSecondsAvg: 30572, pullRequestCount: 20 },
  { gitChangedLinesBucket: '60-99', reviewedInSecondsAvg: 1581, pullRequestCount: 5 },
  { gitChangedLinesBucket: '100-499', reviewedInSecondsAvg: 122352, pullRequestCount: 14 },
  { gitChangedLinesBucket: '500+', reviewedInSecondsAvg: 288799, pullRequestCount: 28 },
];

const expectedBody = {
  data: [
    { lines: '1-9', prCount: 5, averageReviewTimeSeconds: 34017 },
    { lines: '10-59', prCount: 20, averageReviewTimeSeconds: 30572 },
    { lines: '60-99', prCount: 5, averageReviewTimeSeconds: 1581 },
    { lines: '100-499', prCount: 14, averageReviewTimeSeconds: 122352 },
    { lines: '500+', prCount: 28, averageReviewTimeSeconds: 288799 },
  ],
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
  rows?: object[];
}

// The handler resolves the slug to a bucket once, then makes the single pipe call.
const routeTinybird =
  ({ bucket = [{ bucketId: 7 }], rows = pipeRows }: PipeRows = {}) =>
  async (input: unknown) => {
    const url = new URL(String(input));
    return tinybirdResponse(url.pathname === bucketPath ? bucket : rows);
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
  return `/v1-alpha/projects/${slug}/development/review-time-by-pr-size?${search}`;
}

interface OpenApiSchema {
  type?: string;
  nullable?: boolean;
  description?: string;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
}

interface OpenApiParameter {
  name: string;
  in: string;
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

describe('GET /v1-alpha/projects/{slug}/development/review-time-by-pr-size (AC1)', () => {
  it('returns one entry per size bucket in the pipe order', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ rows: pipeRows.map((row) => ({ ...row, sortId: 1, extra: 'x' })) }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body)).toEqual(['data']);
    expect(body.data).toHaveLength(pipeRows.length);
    for (const item of body.data) {
      expect(Object.keys(item).sort()).toEqual(['averageReviewTimeSeconds', 'lines', 'prCount']);
    }
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes one pipe call after one bucket lookup, with the slug as project and the shared filters', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    const lookups = callsTo(bucketPath);
    expect(lookups).toHaveLength(1);
    expect(lookups[0]?.searchParams.get('project')).toBe('kubernetes');
    const calls = pipeCalls();
    expect(calls).toHaveLength(1);
    const call = calls[0];
    expect(call?.origin).toBe(tinybirdHost);
    expect(call?.searchParams.get('project')).toBe('kubernetes');
    expect(call?.searchParams.get('bucketId')).toBe('7');
    expect(call?.searchParams.get('repos')).toBe(`${k8sRepo},${websiteRepo}`);
    expect(call?.searchParams.get('startDate')).toBe(atMidnight(startDate));
    expect(call?.searchParams.get('endDate')).toBe(atMidnight(endDate));
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('treats bucket id 0 as a real bucket and forwards it', async () => {
    mockFetch.mockImplementation(routeTinybird({ bucket: [{ bucketId: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    expect(pipeCalls()[0]?.searchParams.get('bucketId')).toBe('0');
  });

  it('omits repos from the pipe call when the caller sends none', async () => {
    await get(url());
    expect(pipeCalls()).toHaveLength(1);
    expect(pipeCalls()[0]?.searchParams.has('repos')).toBe(false);
  });

  it('drops an empty repos value instead of sending it to the pipe as a filter', async () => {
    await get(url({ repos: '' }));
    expect(pipeCalls()).toHaveLength(1);
    expect(pipeCalls()[0]?.searchParams.has('repos')).toBe(false);
  });

  it('keeps the other repos values when one of them is empty', async () => {
    await get(url({ repos: ['', k8sRepo] }));
    expect(pipeCalls()).toHaveLength(1);
    expect(pipeCalls()[0]?.searchParams.get('repos')).toBe(k8sRepo);
  });

  it('accepts a granularity query param and does not forward it', async () => {
    const res = await get(url({ granularity: 'monthly' }));
    expect(res.statusCode).toBe(200);
    expect(pipeCalls()).toHaveLength(1);
    expect(pipeCalls()[0]?.searchParams.has('granularity')).toBe(false);
  });
});

describe('null average (AC3)', () => {
  // The pipe declares reviewedInSecondsAvg Nullable(Float64).
  it('passes a null average through with the pull request count intact', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        rows: [{ gitChangedLinesBucket: '60-99', reviewedInSecondsAvg: null, pullRequestCount: 5 }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [{ lines: '60-99', prCount: 5, averageReviewTimeSeconds: null }],
    });
  });

  it('keeps a zero average as 0 rather than null', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        rows: [{ gitChangedLinesBucket: '1-9', reviewedInSecondsAvg: 0, pullRequestCount: 3 }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [{ lines: '1-9', prCount: 3, averageReviewTimeSeconds: 0 }],
    });
  });
});

describe('empty results (AC4)', () => {
  it('returns an empty data list when the pipe has no rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ rows: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
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

  it('returns 200 with an empty data list after only the bucket lookup when the slug has no bucket', async () => {
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(callsTo(bucketPath)[0]?.searchParams.get('project')).toBe('no-such-project');
    expect(pipeCalls()).toHaveLength(0);
  });
});

describe('request validation (AC6)', () => {
  it('rejects a timestamp in startDate', async () => {
    const res = await get(url({ startDate: '2025-01-01T00:00:00Z' }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
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
      const call = pipeCalls()[0];
      expect(call?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
      expect(call?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('Tinybird failures (AC7)', () => {
  const upstreamDetail = 'tinybird internal detail';
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

  it('lists the route tagged Development, naming the size labels and the first review', async () => {
    const operation = await getOperation();
    expect(operation?.tags).toEqual(['Development']);
    for (const label of ['1-9', '10-59', '60-99', '100-499', '500+']) {
      expect(operation?.description).toContain(label);
    }
    expect(operation?.description).toMatch(/first review/i);
  });

  it('documents every field of the 200 response with its type', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    expect(schema?.required).toEqual(['data']);
    expect(schema?.properties?.data?.description).toBeTruthy();
    const item = schema?.properties?.data?.items;
    const fields = ['lines', 'prCount', 'averageReviewTimeSeconds'];
    expect(item?.required).toEqual(expect.arrayContaining(fields));
    for (const field of fields) {
      expect(item?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    expect(item?.properties?.lines).toMatchObject({ type: 'string' });
    expect(item?.properties?.prCount).toMatchObject({ type: 'integer' });
    expect(item?.properties?.averageReviewTimeSeconds).toMatchObject({
      type: 'number',
      nullable: true,
    });
  });

  it('documents exactly the repos, startDate and endDate query params', async () => {
    const operation = await getOperation();
    const names = operation?.parameters
      ?.filter((param) => param.in === 'query')
      .map((param) => param.name)
      .sort();
    expect(names).toEqual(['endDate', 'repos', 'startDate']);
  });

  it('keeps the route out of /v1', async () => {
    const res = await get('/v1/openapi.json');
    expect(res.statusCode).toBe(200);
    expect(Object.keys(res.json<OpenApiDoc>().paths)).not.toContain(specPath);
    const v1 = await get(url().replace('/v1-alpha/', '/v1/'));
    expect(v1.statusCode).toBe(404);
  });
});
