// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const route = '/v1-alpha/projects/kubernetes/development/commit-activities';
const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';
const bucketId = 7;
const range = 'startDate=2025-01-01&endDate=2025-03-31';
const repos = `repos=${encodeURIComponent(k8sRepo)}&repos=${encodeURIComponent(websiteRepo)}`;
const baseQuery = `${range}&granularity=monthly&${repos}`;

// The previous period of 2025-01-01..2025-03-31, per getPreviousDates.
const currentStart = '2025-01-01 00:00:00';
const previousStart = '2024-10-01 00:00:00';
const previousEnd = '2024-12-31 00:00:00';
const summaryCounts: Record<string, number> = { [currentStart]: 120, [previousStart]: 100 };

// Tinybird returns Date columns as YYYY-MM-DD; the extra key stands in for the rest of a pipe row.
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

const jsonResponse = (rows: object[]) =>
  new Response(
    JSON.stringify({
      data: rows,
      meta: [],
      rows: rows.length,
      statistics: { elapsed: 0.01, rows_read: 1, bytes_read: 1 },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );

type PipeHandler = (url: URL) => Response | Promise<Response>;

const buckets = '/v0/pipes/project_buckets.json';
const activitiesCount = '/v0/pipes/activities_count.json';
const cumulativeCount = '/v0/pipes/activities_cumulative_count.json';

const defaultPipes: Record<string, PipeHandler> = {
  [buckets]: () => jsonResponse([{ bucketId }]),
  [activitiesCount]: (url) =>
    url.searchParams.has('granularity')
      ? jsonResponse(monthlyRows)
      : jsonResponse([
          { activityCount: summaryCounts[url.searchParams.get('startDate') ?? ''] ?? 0 },
        ]),
  [cumulativeCount]: () => jsonResponse(monthlyRows),
};

// Routes the stubbed fetch by pipe path so a test overrides one pipe at a time.
function stubTinybird(overrides: Record<string, PipeHandler> = {}) {
  const pipes = { ...defaultPipes, ...overrides };
  mockFetch.mockImplementation(async (input: string | URL) => {
    const url = new URL(String(input));
    const handler = pipes[url.pathname];
    if (!handler) {
      throw new Error(`unexpected Tinybird call to ${url.pathname}`);
    }
    return handler(url);
  });
}

const calls = () => mockFetch.mock.calls.map((call) => new URL(String(call[0])));
const callsTo = (pipe: string) => calls().filter((url) => url.pathname === pipe);
const params = (url: URL) => Object.fromEntries(url.searchParams);
const isSeries = (url: URL) => url.searchParams.has('granularity');

interface OpenApiSchema {
  type?: string;
  enum?: string[];
  format?: string;
  nullable?: boolean;
  default?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
}

interface OpenApiOperation {
  tags?: string[];
  // @fastify/swagger lifts a query property's description onto the parameter object.
  parameters?: {
    name: string;
    in: string;
    required?: boolean;
    description?: string;
    schema: OpenApiSchema;
  }[];
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
  mockFetch.mockReset();
  stubTinybird();
});

const get = (url: string) => app.inject({ method: 'GET', url });

describe('response shape (AC1, AC11)', () => {
  it('returns the period summary and new commits per bucket by default', async () => {
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ summary: expectedSummary, data: expectedRows });
  });

  it('reads a missing summary row or bucket count as 0', async () => {
    stubTinybird({
      [activitiesCount]: (url) =>
        isSeries(url)
          ? jsonResponse([{ startDate: '2025-01-01', endDate: '2025-01-31' }])
          : jsonResponse([]),
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
  it('resolves the bucket once, then makes the three pipe calls Nuxt makes', async () => {
    await get(`${route}?${baseQuery}`);
    expect(mockFetch).toHaveBeenCalledTimes(4);
    for (const url of calls()) {
      expect(url.origin).toBe(tinybirdHost);
    }

    const bucketCalls = callsTo(buckets);
    expect(bucketCalls).toHaveLength(1);
    expect(bucketCalls[0]?.searchParams.get('project')).toBe('kubernetes');

    const pipeCalls = callsTo(activitiesCount);
    expect(pipeCalls).toHaveLength(3);
    for (const url of pipeCalls) {
      expect(params(url)).toMatchObject({
        project: 'kubernetes',
        bucketId: String(bucketId),
        activity_type: 'authored-commit',
        onlyContributions: 'true',
        includeCodeContributions: 'true',
        includeCollaborations: 'false',
        repos: `${k8sRepo},${websiteRepo}`,
      });
      expect(url.searchParams.has('countType')).toBe(false);
    }

    const summaries = pipeCalls.filter((url) => !isSeries(url));
    expect(summaries.map((url) => [params(url).startDate, params(url).endDate])).toEqual(
      expect.arrayContaining([
        [currentStart, '2025-03-31 00:00:00'],
        [previousStart, previousEnd],
      ]),
    );
    expect(summaries).toHaveLength(2);

    const series = pipeCalls.filter(isSeries);
    expect(series).toHaveLength(1);
    expect(params(series[0] as URL)).toMatchObject({
      granularity: 'monthly',
      startDate: currentStart,
      endDate: '2025-03-31 00:00:00',
    });
  });

  it('keeps the three pipe calls in flight at the same time', async () => {
    // Each pipe call answers only once all three have been issued, so a sequential
    // implementation never completes and loses the race below.
    let issued = 0;
    let release!: () => void;
    const allIssued = new Promise<void>((resolve) => {
      release = resolve;
    });
    stubTinybird({
      [activitiesCount]: async (url) => {
        issued += 1;
        if (issued === 3) {
          release();
        }
        await allIssued;
        return defaultPipes[activitiesCount]!(url);
      },
    });

    const timeout = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 1000));
    const outcome = await Promise.race([get(`${route}?${baseQuery}`), timeout]);
    expect(outcome).not.toBe('timeout');
    expect((outcome as Awaited<ReturnType<typeof get>>).statusCode).toBe(200);
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
    expect(params(series[0] as URL)).toMatchObject({ granularity: 'monthly', bucketId: '7' });
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
  it('is required', async () => {
    const res = await get(`${route}?${range}`);
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects hourly', async () => {
    const res = await get(`${route}?${range}&granularity=hourly`);
    expect(res.statusCode).toBe(400);
  });

  it('is forwarded on the series call only', async () => {
    const res = await get(`${route}?${range}&granularity=weekly`);
    expect(res.statusCode).toBe(200);
    const pipeCalls = callsTo(activitiesCount);
    expect(pipeCalls.filter(isSeries).map((url) => params(url).granularity)).toEqual(['weekly']);
    expect(pipeCalls.filter((url) => !isSeries(url))).toHaveLength(2);
  });
});

describe('date range (AC6)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('forwards no dates for the current range when the caller omits them', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2025-03-31T12:00:00Z'));

    const res = await get(`${route}?granularity=monthly`);
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({
      periodFrom: '2010-01-01T00:00:00Z',
      periodTo: '2025-03-31T00:00:00Z',
    });

    const pipeCalls = callsTo(activitiesCount);
    const undated = pipeCalls.filter((url) => !url.searchParams.has('startDate'));
    expect(undated).toHaveLength(2);
    for (const url of undated) {
      expect(url.searchParams.has('endDate')).toBe(false);
    }
    expect(undated.filter(isSeries)).toHaveLength(1);

    const previous = pipeCalls.filter((url) => url.searchParams.has('startDate'));
    expect(previous.map(params)).toEqual([
      expect.objectContaining({
        startDate: '1994-10-01 00:00:00',
        endDate: '2009-12-31 00:00:00',
      }),
    ]);
    expect(previous[0]?.searchParams.has('granularity')).toBe(false);
  });

  it('rejects a timestamp in startDate', async () => {
    const res = await get(`${route}?startDate=2025-01-01T00%3A00%3A00Z&granularity=monthly`);
    expect(res.statusCode).toBe(400);
  });

  it('rejects an inverted range before calling Tinybird', async () => {
    const res = await get(`${route}?startDate=2025-04-01&endDate=2025-03-31&granularity=monthly`);
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('invalid_request');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('unknown slug (AC7)', () => {
  beforeEach(() => {
    // The Tinybird client logs the missing bucket; keep the test output readable.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with a zero summary and no buckets, without calling a pipe', async () => {
    stubTinybird({ [buckets]: () => jsonResponse([]) });
    const res = await get(
      `/v1-alpha/projects/no-such-project/development/commit-activities?${baseQuery}`,
    );
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: { ...expectedSummary, current: 0, previous: 0, percentageChange: 0, changeValue: 0 },
      data: [],
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(callsTo(buckets)).toHaveLength(1);
  });
});

describe('Tinybird failures (AC8)', () => {
  const upstreamDetail = 'tinybird internal detail';
  const failWith = (status: number, statusText: string) => async () =>
    new Response(upstreamDetail, { status, statusText });

  beforeEach(() => {
    // The Tinybird client logs every failed request; keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function expectUpstreamUnavailable() {
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  }

  it.each([
    [500, 'Internal Server Error'],
    [401, 'Unauthorized'],
    [429, 'Too Many Requests'],
  ])('maps a Tinybird %i on a pipe call to 503 upstream_unavailable', async (status, text) => {
    stubTinybird({ [activitiesCount]: failWith(status, text) });
    await expectUpstreamUnavailable();
  });

  it('maps a Tinybird 500 on the bucket lookup to 503 upstream_unavailable', async () => {
    stubTinybird({ [buckets]: failWith(500, 'Internal Server Error') });
    await expectUpstreamUnavailable();
  });

  it('maps a network error to 503 upstream_unavailable', async () => {
    mockFetch.mockRejectedValue(new TypeError(`fetch failed: ${upstreamDetail}`));
    await expectUpstreamUnavailable();
  });

  it('maps a response that is not JSON to 503 upstream_unavailable', async () => {
    stubTinybird({
      [activitiesCount]: async () =>
        new Response(`<html>${upstreamDetail}</html>`, { status: 200 }),
    });
    await expectUpstreamUnavailable();
  });
});

describe('caching headers (AC9)', () => {
  it('sets Cache-Control: private, max-age=0 on a successful response', async () => {
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('sets the same header on a validation error', async () => {
    const res = await get(`${route}?${range}`);
    expect(res.statusCode).toBe(400);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });
});

describe('OpenAPI (AC10)', () => {
  const specPath = '/v1-alpha/projects/{slug}/development/commit-activities';

  async function getSpec(url: string): Promise<OpenApiDoc> {
    const res = await get(url);
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>();
  }

  async function getOperation(): Promise<OpenApiOperation> {
    const spec = await getSpec('/v1-alpha/openapi.json');
    const operation = spec.paths[specPath]?.get;
    expect(operation, `${specPath} is missing from the spec`).toBeDefined();
    return operation as OpenApiOperation;
  }

  function expectDescribed(schema: OpenApiSchema | undefined, path: string) {
    expect(schema, `${path} is missing`).toBeDefined();
    for (const [name, property] of Object.entries(schema?.properties ?? {})) {
      expect(property.description, `${path}.${name} has no description`).toBeTruthy();
      expectDescribed(property.items ?? property, `${path}.${name}`);
    }
  }

  it('tags the route Development', async () => {
    const operation = await getOperation();
    expect(operation.tags).toEqual(['Development']);
  });

  it('documents the query parameters', async () => {
    const operation = await getOperation();
    const byName = Object.fromEntries((operation.parameters ?? []).map((p) => [p.name, p]));
    for (const name of ['repos', 'startDate', 'endDate', 'granularity', 'countType']) {
      expect(byName[name]?.in, `${name} is not a query parameter`).toBe('query');
      expect(byName[name]?.description, `${name} has no description`).toBeTruthy();
    }
    expect(byName.granularity?.required).toBe(true);
    expect(byName.granularity?.schema.enum).toEqual([
      'daily',
      'weekly',
      'monthly',
      'quarterly',
      'yearly',
    ]);
    expect(byName.countType?.required).toBeFalsy();
    expect(byName.countType?.schema.enum).toEqual(['new', 'cumulative']);
    expect(byName.countType?.schema.default).toBe('new');
  });

  it('describes every field of the 200 response', async () => {
    const operation = await getOperation();
    const schema = operation.responses['200']?.content['application/json']?.schema;
    expect(schema?.required).toEqual(expect.arrayContaining(['summary', 'data']));
    expectDescribed(schema, 'response');

    const summary = schema?.properties?.summary;
    expect(summary?.required).toEqual(expect.arrayContaining(Object.keys(expectedSummary)));
    expect(summary?.properties?.percentageChange).toMatchObject({ type: 'number', nullable: true });
    expect(summary?.properties?.periodFrom?.format).toBe('date-time');
    expect(summary?.properties?.periodTo?.format).toBe('date-time');

    const row = schema?.properties?.data?.items;
    expect(row?.required).toEqual(expect.arrayContaining(['startDate', 'endDate', 'commits']));
    expect(row?.properties?.startDate?.format).toBe('date-time');
    expect(row?.properties?.endDate?.format).toBe('date-time');
    expect(row?.properties?.commits?.type).toBe('integer');
  });

  it('keeps the route out of /v1', async () => {
    const spec = await getSpec('/v1/openapi.json');
    expect(Object.keys(spec.paths)).not.toContain(specPath);
    expect(Object.keys(spec.paths)).not.toContain(
      '/v1/projects/{slug}/development/commit-activities',
    );
    const res = await get('/v1/projects/kubernetes/development/commit-activities');
    expect(res.statusCode).toBe(404);
  });
});
