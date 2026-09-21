// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { getTinybirdClient } from '../src/clients/tinybird.js';
import { getPreviousDates } from '../src/lib/period.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const route = '/v1-alpha/projects/kubernetes/development/issues-resolution';
const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';

const bucketsPath = '/v0/pipes/project_buckets.json';
const activitiesPath = '/v0/pipes/activities_count.json';
const velocityPath = '/v0/pipes/issues_average_resolve_velocity.json';

// The request range and the previous range getPreviousDates derives from it (the UI's 90d preset).
const range = { startDate: '2025-06-20', endDate: '2025-09-18' };
const previousRange = { startDate: '2025-03-21', endDate: '2025-06-19' };
const tinybirdDay = (day: string) => `${day} 00:00:00`;
const isoDay = (day: string) => `${day}T00:00:00Z`;

// One row set per pipe call, shaped like frontend/server/mocks/tinybird-issues-response.mock.ts.
interface PipeRows {
  buckets: object[];
  currentSummary: object[];
  previousSummary: object[];
  opened: object[];
  closed: object[];
  velocity: object[];
}

const june = { startDate: '2025-06-01', endDate: '2025-06-30' };
const july = { startDate: '2025-07-01', endDate: '2025-07-31' };
const august = { startDate: '2025-08-01', endDate: '2025-08-31' };

const defaultRows: PipeRows = {
  buckets: [{ bucketId: 3 }],
  currentSummary: [{ activityCount: 100 }],
  previousSummary: [{ activityCount: 50 }],
  opened: [
    { ...june, activityCount: 12, cumulativeActivityCount: 12 },
    { ...july, activityCount: 3, cumulativeActivityCount: 15 },
    { ...august, activityCount: 8, cumulativeActivityCount: 23 },
  ],
  closed: [
    { ...june, activityCount: 8 },
    { ...july, activityCount: 1 },
    { ...august, activityCount: 6 },
  ],
  velocity: [{ averageIssueResolveVelocitySeconds: 7451999 }],
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

// Picks the row set a pipe request asks for. The previous summary is the only call that carries a
// startDate other than the caller's own.
function pipeRows(url: URL, rows: PipeRows): object[] {
  const params = url.searchParams;
  switch (url.pathname) {
    case bucketsPath:
      return rows.buckets;
    case velocityPath:
      return rows.velocity;
    case activitiesPath: {
      if (params.has('granularity')) {
        return params.get('activity_type') === 'issues-opened' ? rows.opened : rows.closed;
      }
      const start = params.get('startDate');
      return start === null || start === tinybirdDay(range.startDate)
        ? rows.currentSummary
        : rows.previousSummary;
    }
    default:
      throw new Error(`unexpected Tinybird path ${url.pathname}`);
  }
}

type Override = (url: URL) => Response | Promise<Response> | undefined;

function serveTinybird(rows: PipeRows = defaultRows, override?: Override) {
  mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    return (await override?.(url)) ?? tinybirdResponse(pipeRows(url, rows));
  });
}

const failWith =
  (path: string, response: () => Response | Promise<Response>): Override =>
  (url) =>
    url.pathname === path ? response() : undefined;

const calledUrls = () => mockFetch.mock.calls.map((call) => new URL(String(call[0])));
const callsTo = (path: string) => calledUrls().filter((url) => url.pathname === path);

function paramsOf(predicate: (url: URL) => boolean): URLSearchParams {
  const url = calledUrls().find(predicate);
  expect(url, 'expected Tinybird call was not made').toBeDefined();
  return url!.searchParams;
}

const seriesParams = (activityType: string) =>
  paramsOf(
    (url) =>
      url.pathname === activitiesPath &&
      url.searchParams.has('granularity') &&
      url.searchParams.get('activity_type') === activityType,
  );

const summaryParams = (startDate: string | null) =>
  paramsOf(
    (url) =>
      url.pathname === activitiesPath &&
      !url.searchParams.has('granularity') &&
      url.searchParams.get('startDate') === startDate,
  );

const velocityParams = () => paramsOf((url) => url.pathname === velocityPath);

function withQuery(params: Record<string, string | string[]>, path = route): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of [value].flat()) query.append(key, item);
  }
  return `${path}?${query}`;
}

const defaultQuery = { granularity: 'monthly', ...range, repos: [k8sRepo, websiteRepo] };

interface OpenApiSchema {
  type?: string;
  description?: string;
  format?: string;
  enum?: string[];
  nullable?: boolean;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
}

interface OpenApiOperation {
  tags?: string[];
  parameters?: { name: string; in: string; required?: boolean; schema: OpenApiSchema }[];
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
  mockFetch.mockReset();
  serveTinybird();
});

const get = (url: string) => app.inject({ method: 'GET', url });

describe('response shape (AC1)', () => {
  it('returns the summary and the merged buckets for a known slug', async () => {
    const res = await get(withQuery(defaultQuery));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: {
        current: 100,
        previous: 50,
        percentageChange: 100,
        changeValue: 50,
        periodFrom: isoDay(range.startDate),
        periodTo: isoDay(range.endDate),
        avgResolveTimeSeconds: 7451999,
      },
      data: [
        {
          startDate: isoDay(june.startDate),
          endDate: isoDay(june.endDate),
          totalIssues: 12,
          closedIssues: 8,
        },
        {
          startDate: isoDay(july.startDate),
          endDate: isoDay(july.endDate),
          totalIssues: 3,
          closedIssues: 1,
        },
        {
          startDate: isoDay(august.startDate),
          endDate: isoDay(august.endDate),
          totalIssues: 8,
          closedIssues: 6,
        },
      ],
    });
  });

  it('returns only the documented keys', async () => {
    const res = await get(withQuery(defaultQuery));
    const body = res.json<{ summary: object; data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'summary']);
    expect(Object.keys(body.summary).sort()).toEqual([
      'avgResolveTimeSeconds',
      'changeValue',
      'current',
      'percentageChange',
      'periodFrom',
      'periodTo',
      'previous',
    ]);
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual([
        'closedIssues',
        'endDate',
        'startDate',
        'totalIssues',
      ]);
    }
  });
});

describe('Tinybird calls (AC2)', () => {
  it('resolves the bucket once, then makes four activities_count calls and one velocity call', async () => {
    await get(withQuery(defaultQuery));
    expect(mockFetch).toHaveBeenCalledTimes(6);
    expect(callsTo(bucketsPath)).toHaveLength(1);
    expect(callsTo(activitiesPath)).toHaveLength(4);
    expect(callsTo(velocityPath)).toHaveLength(1);
    const lookup = callsTo(bucketsPath)[0]!;
    expect(lookup.origin).toBe(tinybirdHost);
    expect(lookup.searchParams.get('project')).toBe('kubernetes');
  });

  it('sends the common filter on every pipe call', async () => {
    await get(withQuery(defaultQuery));
    const pipeCalls = [...callsTo(activitiesPath), ...callsTo(velocityPath)];
    expect(pipeCalls).toHaveLength(5);
    for (const url of pipeCalls) {
      const params = url.searchParams;
      expect(params.get('project')).toBe('kubernetes');
      expect(params.get('bucketId')).toBe('3');
      expect(params.get('repos')).toBe(`${k8sRepo},${websiteRepo}`);
      expect(params.get('countType')).toBe('new');
      expect(params.get('onlyContributions')).toBe('false');
      expect(params.get('includeCodeContributions')).toBe('true');
      expect(params.get('includeCollaborations')).toBe('true');
    }
  });

  it('sends the per-call activity type, granularity and dates', async () => {
    await get(withQuery(defaultQuery));

    const currentSummary = summaryParams(tinybirdDay(range.startDate));
    expect(currentSummary.get('activity_type')).toBe('issues-closed');
    expect(currentSummary.get('endDate')).toBe(tinybirdDay(range.endDate));

    const previousSummary = summaryParams(tinybirdDay(previousRange.startDate));
    expect(previousSummary.get('activity_type')).toBe('issues-closed');
    expect(previousSummary.get('endDate')).toBe(tinybirdDay(previousRange.endDate));

    const opened = seriesParams('issues-opened');
    expect(opened.get('granularity')).toBe('monthly');
    expect(opened.get('startDate')).toBe(tinybirdDay(range.startDate));
    expect(opened.get('endDate')).toBe(tinybirdDay(range.endDate));

    const closed = seriesParams('issues-closed');
    expect(closed.get('granularity')).toBe('monthly');
    expect(closed.get('startDate')).toBe(tinybirdDay(range.startDate));
    expect(closed.get('endDate')).toBe(tinybirdDay(range.endDate));

    const velocity = velocityParams();
    expect(velocity.has('activity_type')).toBe(false);
    expect(velocity.has('granularity')).toBe(false);
    expect(velocity.get('startDate')).toBe(tinybirdDay(range.startDate));
    expect(velocity.get('endDate')).toBe(tinybirdDay(range.endDate));
  });

  it('has the five pipe calls in flight together', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    serveTinybird(defaultRows, (url) =>
      url.pathname === bucketsPath
        ? undefined
        : gate.then(() => tinybirdResponse(pipeRows(url, defaultRows))),
    );

    const pending = get(withQuery(defaultQuery));
    await vi.waitFor(() =>
      expect(callsTo(activitiesPath).length + callsTo(velocityPath).length).toBe(5),
    );
    release();
    expect((await pending).statusCode).toBe(200);
  });
});

describe('omitted dates (AC3)', () => {
  it('sends no dates on the current-period calls, the computed range on the previous summary, and reports the default period', async () => {
    const { current, previous } = getPreviousDates();
    const res = await get(withQuery({ granularity: 'monthly' }));
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({
      periodFrom: isoDay('2010-01-01'),
      periodTo: isoDay(current.endDate),
    });

    for (const params of [
      summaryParams(null),
      seriesParams('issues-opened'),
      seriesParams('issues-closed'),
      velocityParams(),
    ]) {
      expect(params.has('startDate')).toBe(false);
      expect(params.has('endDate')).toBe(false);
      expect(params.has('repos')).toBe(false);
    }
    const previousSummary = summaryParams(tinybirdDay(previous.startDate));
    expect(previousSummary.get('endDate')).toBe(tinybirdDay(previous.endDate));
  });
});

describe('merge and summary edge cases (AC4)', () => {
  it('gives 0 for the series a bucket is missing from', async () => {
    serveTinybird({
      ...defaultRows,
      opened: [{ ...june, activityCount: 12 }],
      closed: [{ ...july, activityCount: 1 }],
    });
    const res = await get(withQuery(defaultQuery));
    expect(res.json().data).toEqual([
      {
        startDate: isoDay(june.startDate),
        endDate: isoDay(june.endDate),
        totalIssues: 12,
        closedIssues: 0,
      },
      {
        startDate: isoDay(july.startDate),
        endDate: isoDay(july.endDate),
        totalIssues: 0,
        closedIssues: 1,
      },
    ]);
  });

  it('sorts buckets ascending by startDate whatever order the pipe returns', async () => {
    serveTinybird({
      ...defaultRows,
      opened: [
        { ...august, activityCount: 8 },
        { ...june, activityCount: 12 },
      ],
      closed: [
        { ...july, activityCount: 1 },
        { ...june, activityCount: 8 },
      ],
    });
    const res = await get(withQuery(defaultQuery));
    const starts = res.json<{ data: { startDate: string }[] }>().data.map((b) => b.startDate);
    expect(starts).toEqual([
      isoDay(june.startDate),
      isoDay(july.startDate),
      isoDay(august.startDate),
    ]);
  });

  it('returns an empty data list when both series are empty', async () => {
    serveTinybird({ ...defaultRows, opened: [], closed: [] });
    const res = await get(withQuery(defaultQuery));
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([]);
  });

  it('reports a drop as a negative percentageChange', async () => {
    serveTinybird({
      ...defaultRows,
      currentSummary: [{ activityCount: 50 }],
      previousSummary: [{ activityCount: 100 }],
    });
    const res = await get(withQuery(defaultQuery));
    expect(res.json().summary).toMatchObject({
      current: 50,
      previous: 100,
      percentageChange: -50,
      changeValue: -50,
    });
  });

  it('reports percentageChange null when previous is 0 and current is not', async () => {
    serveTinybird({ ...defaultRows, previousSummary: [] });
    const res = await get(withQuery(defaultQuery));
    expect(res.json().summary).toMatchObject({ current: 100, previous: 0, percentageChange: null });
  });

  it('reports avgResolveTimeSeconds null when the velocity pipe has no row', async () => {
    serveTinybird({ ...defaultRows, velocity: [] });
    const res = await get(withQuery(defaultQuery));
    expect(res.statusCode).toBe(200);
    expect(res.json().summary.avgResolveTimeSeconds).toBeNull();
  });

  it('reports avgResolveTimeSeconds null when the average is null', async () => {
    serveTinybird({ ...defaultRows, velocity: [{ averageIssueResolveVelocitySeconds: null }] });
    const res = await get(withQuery(defaultQuery));
    expect(res.statusCode).toBe(200);
    expect(res.json().summary.avgResolveTimeSeconds).toBeNull();
  });
});

describe('unknown slug (AC5)', () => {
  beforeEach(() => {
    // The Tinybird client warns when a project has no bucket; keep the test output readable.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with zero data after only the bucket lookup', async () => {
    serveTinybird({ ...defaultRows, buckets: [] });
    const res = await get(
      withQuery(defaultQuery, '/v1-alpha/projects/no-such-project/development/issues-resolution'),
    );
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: {
        current: 0,
        previous: 0,
        percentageChange: 0,
        changeValue: 0,
        periodFrom: isoDay(range.startDate),
        periodTo: isoDay(range.endDate),
        avgResolveTimeSeconds: null,
      },
      data: [],
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(callsTo(bucketsPath)[0]?.searchParams.get('project')).toBe('no-such-project');
  });
});

describe('validation (AC6)', () => {
  it.each([
    ['a missing granularity', { ...range }],
    ['granularity=hourly', { ...range, granularity: 'hourly' }],
    ['a timestamp in startDate', { granularity: 'monthly', startDate: '2025-06-20T00:00:00Z' }],
  ])('returns 400 for %s without calling Tinybird', async (_label, params) => {
    const res = await get(withQuery(params));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns 400 invalid_request for an inverted range without calling Tinybird', async () => {
    const res = await get(
      withQuery({ granularity: 'monthly', startDate: '2025-09-18', endDate: '2025-06-20' }),
    );
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('invalid_request');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('ignores unknown query keys', async () => {
    const res = await get(withQuery({ ...defaultQuery, platform: 'github' }));
    expect(res.statusCode).toBe(200);
  });
});

describe('Tinybird failures (AC7)', () => {
  const upstreamDetail = 'tinybird internal detail';

  beforeEach(() => {
    // The Tinybird client logs every failed request; keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [500, 'Internal Server Error'],
    [401, 'Unauthorized'],
    [429, 'Too Many Requests'],
  ])(
    'maps a Tinybird %i on a pipe call to 503 upstream_unavailable',
    async (status, statusText) => {
      serveTinybird(
        defaultRows,
        failWith(activitiesPath, () => new Response(upstreamDetail, { status, statusText })),
      );
      const res = await get(withQuery(defaultQuery));
      expect(res.statusCode).toBe(503);
      expect(res.json().code).toBe('upstream_unavailable');
      expect(res.body).not.toContain(upstreamDetail);
      expect(res.body).not.toContain(String(status));
    },
  );

  it('maps a network error on a pipe call to 503 upstream_unavailable', async () => {
    serveTinybird(
      defaultRows,
      failWith(velocityPath, () =>
        Promise.reject(new TypeError(`fetch failed: ${upstreamDetail}`)),
      ),
    );
    const res = await get(withQuery(defaultQuery));
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a pipe response that is not JSON to 503 upstream_unavailable', async () => {
    serveTinybird(
      defaultRows,
      failWith(activitiesPath, () => new Response('<html>oops</html>', { status: 200 })),
    );
    const res = await get(withQuery(defaultQuery));
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
  });

  it('maps a Tinybird 500 on the bucket lookup to 503 upstream_unavailable', async () => {
    serveTinybird(
      defaultRows,
      failWith(bucketsPath, () => new Response(upstreamDetail, { status: 500 })),
    );
    const res = await get(withQuery(defaultQuery));
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
    expect(callsTo(activitiesPath)).toHaveLength(0);
  });

  it('maps a network error on the bucket lookup to 503 upstream_unavailable', async () => {
    serveTinybird(
      defaultRows,
      failWith(bucketsPath, () => Promise.reject(new TypeError(`fetch failed: ${upstreamDetail}`))),
    );
    const res = await get(withQuery(defaultQuery));
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });
});

describe('caching headers (AC8)', () => {
  it('sets Cache-Control: private, max-age=0 on a successful response', async () => {
    const res = await get(withQuery(defaultQuery));
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('sets the same header on a 503', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    serveTinybird(
      defaultRows,
      failWith(activitiesPath, () => new Response('down', { status: 500 })),
    );
    const res = await get(withQuery(defaultQuery));
    expect(res.statusCode).toBe(503);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
    vi.restoreAllMocks();
  });
});

describe('/v1-alpha spec (AC9)', () => {
  const routePath = '/v1-alpha/projects/{slug}/development/issues-resolution';

  async function getOperation(): Promise<OpenApiOperation> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    const operation = res.json<OpenApiDoc>().paths[routePath]?.get;
    expect(operation, `${routePath} is not in the alpha spec`).toBeDefined();
    return operation!;
  }

  it('tags the route Development', async () => {
    const operation = await getOperation();
    expect(operation.tags).toEqual(['Development']);
  });

  it('requires granularity as a five-value enum and documents the date range', async () => {
    const operation = await getOperation();
    const granularity = operation.parameters?.find((p) => p.name === 'granularity');
    expect(granularity?.in).toBe('query');
    expect(granularity?.required).toBe(true);
    expect(granularity?.schema.enum).toEqual(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
    const startDate = operation.parameters?.find((p) => p.name === 'startDate');
    expect(startDate?.required).toBeFalsy();
    expect(startDate?.schema.format).toBe('date');
  });

  it('documents every field of the 200 response with its format', async () => {
    const operation = await getOperation();
    const schema = operation.responses['200']?.content['application/json']?.schema;
    expect(schema?.required).toEqual(expect.arrayContaining(['summary', 'data']));
    expect(schema?.properties?.summary?.description).toBeTruthy();
    expect(schema?.properties?.data?.description).toBeTruthy();

    const summary = schema?.properties?.summary;
    const summaryFields = [
      'current',
      'previous',
      'percentageChange',
      'changeValue',
      'periodFrom',
      'periodTo',
      'avgResolveTimeSeconds',
    ];
    expect(summary?.required).toEqual(expect.arrayContaining(summaryFields));
    for (const field of summaryFields) {
      expect(
        summary?.properties?.[field]?.description,
        `summary.${field} has no description`,
      ).toBeTruthy();
    }
    expect(summary?.properties?.avgResolveTimeSeconds?.nullable).toBe(true);
    expect(summary?.properties?.periodFrom?.format).toBe('date-time');

    const bucket = schema?.properties?.data?.items;
    const bucketFields = ['startDate', 'endDate', 'totalIssues', 'closedIssues'];
    expect(bucket?.required).toEqual(expect.arrayContaining(bucketFields));
    for (const field of bucketFields) {
      expect(
        bucket?.properties?.[field]?.description,
        `data[].${field} has no description`,
      ).toBeTruthy();
    }
    expect(bucket?.properties?.startDate?.format).toBe('date-time');
    expect(bucket?.properties?.endDate?.format).toBe('date-time');
  });

  it('keeps the route out of /v1', async () => {
    const res = await get('/v1/openapi.json');
    expect(res.statusCode).toBe(200);
    expect(Object.keys(res.json<OpenApiDoc>().paths)).not.toContain(routePath);
    const v1 = await get(
      withQuery(defaultQuery, '/v1/projects/kubernetes/development/issues-resolution'),
    );
    expect(v1.statusCode).toBe(404);
  });
});

describe('repos filter', () => {
  const query = `granularity=monthly&startDate=${range.startDate}&endDate=${range.endDate}`;
  const pipes = () =>
    calledUrls().filter((url) => url.pathname !== '/v0/pipes/project_buckets.json');

  it('drops an empty repos value instead of sending a filter that matches nothing', async () => {
    const res = await get(`${route}?${query}&repos=`);
    expect(res.statusCode).toBe(200);
    expect(pipes()).toHaveLength(5);
    for (const url of pipes()) {
      expect(url.searchParams.has('repos')).toBe(false);
    }
  });

  it('keeps the other repos values when one of them is empty', async () => {
    await get(`${route}?${query}&repos=&repos=${encodeURIComponent(k8sRepo)}`);
    expect(pipes()).toHaveLength(5);
    for (const url of pipes()) {
      expect(url.searchParams.get('repos')).toBe(k8sRepo);
    }
  });
});
