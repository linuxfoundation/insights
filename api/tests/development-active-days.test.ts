// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const pipePath = '/v0/pipes/active_days.json';
const bucketPath = '/v0/pipes/project_buckets.json';
const specPath = '/v1-alpha/projects/{slug}/development/active-days';

const startDate = '2025-01-01';
const endDate = '2025-03-31';
// getPreviousDates gives the previous period the same length, ending the day before startDate.
const previousStart = '2024-10-01';
const previousEnd = '2024-12-31';
const atMidnight = (day: string) => `${day} 00:00:00`;
const isoDay = (day: string) => `${day}T00:00:00Z`;

const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';

const currentRow = { activeDaysCount: 80, avgContributionsPerDay: 21.5 };
const previousRow = { activeDaysCount: 64, avgContributionsPerDay: 18 };
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', activityCount: 698 },
  { startDate: '2025-02-01', endDate: '2025-02-28', activityCount: 579 },
  { startDate: '2025-03-01', endDate: '2025-03-31', activityCount: 472 },
];

const expectedBody = {
  summary: {
    current: 80,
    previous: 64,
    percentageChange: 25,
    changeValue: 16,
    periodFrom: isoDay(startDate),
    periodTo: isoDay(endDate),
  },
  avgContributionsPerDay: 21.5,
  data: [
    { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), contributions: 698 },
    { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), contributions: 579 },
    { startDate: isoDay('2025-03-01'), endDate: isoDay('2025-03-31'), contributions: 472 },
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
  avgContributionsPerDay: 0,
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

// The client resolves the slug to a bucket before every pipe call. The series call is the one
// that carries granularity; the two summary calls differ by their startDate.
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

const pipeCalls = () =>
  mockFetch.mock.calls
    .map((call) => new URL(String(call[0])))
    .filter((url) => url.pathname === pipePath);

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
  return `/v1-alpha/projects/${slug}/development/active-days?${search}`;
}

interface OpenApiSchema {
  type?: string;
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

beforeEach(() => {
  mockFetch.mockReset().mockImplementation(routeTinybird());
});

const get = (path: string) => app.inject({ method: 'GET', url: path });

describe('GET /v1-alpha/projects/{slug}/development/active-days (AC1)', () => {
  it('returns the active days summary, the daily average and one bucket per granularity step', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields and the day index', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, avgContributions: 1, extra: 'x' }],
        series: seriesRows.map((row, index) => ({ ...row, day: index + 1, extra: 'x' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['avgContributionsPerDay', 'data', 'summary']);
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(['contributions', 'endDate', 'startDate']);
    }
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three active_days calls with the slug as project and the shared filters', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.searchParams.get('project')).toBe('kubernetes');
      expect(call.searchParams.get('repos')).toBe(`${k8sRepo},${websiteRepo}`);
      expect(call.searchParams.get('includeCodeContributions')).toBe('true');
      expect(call.searchParams.get('includeCollaborations')).toBe('false');
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

describe('includeCollaborations (AC3)', () => {
  it('passes includeCollaborations=true to all three pipe calls', async () => {
    const res = await get(url({ includeCollaborations: 'true' }));
    expect(res.statusCode).toBe(200);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('includeCollaborations')).toBe('true');
      expect(call.searchParams.get('includeCodeContributions')).toBe('true');
    }
  });

  it('rejects a value that is not a boolean', async () => {
    const res = await get(url({ includeCollaborations: 'maybe' }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('percentageChange (AC4)', () => {
  it('is negative when the current period has fewer active days', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ activeDaysCount: 50, avgContributionsPerDay: 3 }],
        previous: [{ activeDaysCount: 100, avgContributionsPerDay: 4 }],
      }),
    );
    const res = await get(url());
    expect(res.json().summary).toMatchObject({
      current: 50,
      previous: 100,
      percentageChange: -50,
      changeValue: -50,
    });
  });

  it('is null when the previous period had no active days and the current one has some', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ activeDaysCount: 0, avgContributionsPerDay: null }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({ current: 80, previous: 0, percentageChange: null });
  });
});

describe('empty results (AC5)', () => {
  it('returns zeros and an empty series when the pipe has no rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [], previous: [], series: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(zeroBody);
  });

  it('returns 0 for a null avgContributionsPerDay', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ activeDaysCount: 0, avgContributionsPerDay: null }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().avgContributionsPerDay).toBe(0);
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

  it('returns 200 with zeros when the bucket lookup has no row for the slug', async () => {
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(zeroBody);
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

  it('defaults the range to 2010-01-01 through today when both dates are omitted', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await get(url({ startDate: undefined, endDate: undefined }));
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({
      periodFrom: isoDay('2010-01-01'),
      periodTo: isoDay(today),
    });
    const series = pipeCalls().find((call) => call.searchParams.has('granularity'));
    expect(series?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
    expect(series?.searchParams.get('endDate')).toBe(atMidnight(today));
  });
});

describe('Tinybird failures (AC8)', () => {
  const upstreamDetail = 'tinybird internal detail';
  const failing = (status: number, statusText: string, path = pipePath) => {
    const respond = routeTinybird();
    return async (input: unknown) =>
      new URL(String(input)).pathname === path
        ? new Response(upstreamDetail, { status, statusText })
        : respond(input);
  };

  beforeEach(() => {
    // The Tinybird client logs every failed request; keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 404 is in the table because only the client's bucket miss may read as empty data; a 404
  // from the pipe itself is an outage.
  it.each([
    [500, 'Internal Server Error'],
    [404, 'Not Found'],
    [401, 'Unauthorized'],
    [429, 'Too Many Requests'],
  ])('maps a pipe %i to 503 upstream_unavailable', async (status, statusText) => {
    mockFetch.mockImplementation(failing(status, statusText));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a failing bucket lookup to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(failing(500, 'Internal Server Error', bucketPath));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a network error to 503 upstream_unavailable', async () => {
    mockFetch.mockRejectedValue(new TypeError(`fetch failed: ${upstreamDetail}`));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a response that is not JSON to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(async () => new Response('<html>oops</html>', { status: 200 }));
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

  it('lists the route in /v1-alpha/openapi.json tagged Development', async () => {
    const operation = await getOperation();
    expect(operation?.tags).toEqual(['Development']);
  });

  it('documents every field of the 200 response', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const fields = ['summary', 'avgContributionsPerDay', 'data'];
    expect(schema?.required).toEqual(expect.arrayContaining(fields));
    for (const field of fields) {
      expect(schema?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    const bucket = schema?.properties?.data?.items;
    const bucketFields = ['startDate', 'endDate', 'contributions'];
    expect(bucket?.required).toEqual(expect.arrayContaining(bucketFields));
    for (const field of bucketFields) {
      expect(bucket?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
  });

  it('documents the query params, with granularity required and includeCollaborations defaulting to false', async () => {
    const operation = await getOperation();
    // The operation also lists the slug path parameter; only the query params are under test.
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual(
      ['endDate', 'granularity', 'includeCollaborations', 'repos', 'startDate'].sort(),
    );
    const granularity = params.get('granularity');
    expect(granularity?.required).toBe(true);
    expect(granularity?.schema.enum).toEqual(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
    expect(granularity?.description ?? granularity?.schema.description).toBeTruthy();
    const includeCollaborations = params.get('includeCollaborations');
    expect(includeCollaborations?.required).toBeFalsy();
    expect(includeCollaborations?.schema).toMatchObject({ type: 'boolean', default: false });
    expect(
      includeCollaborations?.description ?? includeCollaborations?.schema.description,
    ).toBeTruthy();
  });

  it('keeps the route out of /v1', async () => {
    const spec = await get('/v1/openapi.json');
    expect(Object.keys(spec.json<OpenApiDoc>().paths)).not.toContain(specPath);
    const res = await get('/v1/projects/kubernetes/development/active-days?granularity=monthly');
    expect(res.statusCode).toBe(404);
  });
});
