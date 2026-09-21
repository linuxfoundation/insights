// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { getTinybirdClient } from '../src/clients/tinybird.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const route = '/v1-alpha/projects/kubernetes/development/pull-requests';
const rangeQuery = 'startDate=2025-01-01&endDate=2025-03-31&granularity=weekly';

const bucketsPath = '/v0/pipes/project_buckets.json';
const activitiesPath = '/v0/pipes/activities_count.json';
const velocityPath = '/v0/pipes/pull_requests_average_resolve_velocity.json';

const bucketId = 7;
const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';

const openedTypes = 'pull_request-opened,merge_request-opened,changeset-created';
const mergedTypes = 'pull_request-merged,merge_request-merged,changeset-merged';
const closedTypes = 'pull_request-closed,merge_request-closed,changeset-closed,changeset-abandoned';
const activityGroups = [openedTypes, mergedTypes, closedTypes];

// Tinybird wants `YYYY-MM-DD 00:00:00`; the previous range is what getPreviousDates derives.
const currentRange = { startDate: '2025-01-01 00:00:00', endDate: '2025-03-31 00:00:00' };
const previousRange = { startDate: '2024-10-01 00:00:00', endDate: '2024-12-31 00:00:00' };

const summaryCounts: Record<string, { current: number; previous: number }> = {
  [openedTypes]: { current: 100, previous: 50 },
  [mergedTypes]: { current: 25, previous: 40 },
  [closedTypes]: { current: 10, previous: 5 },
};

// The pipe returns bucket bounds as ClickHouse Date values; the three series share their bounds.
const bucketBounds = [
  ['2025-01-01', '2025-01-05'],
  ['2025-01-06', '2025-01-12'],
  ['2025-01-13', '2025-01-19'],
];
const seriesCounts: Record<string, number[]> = {
  [openedTypes]: [11, 4, 7],
  [mergedTypes]: [8, 1, 6],
  [closedTypes]: [2, 1, 3],
};
const resolveSeconds = 7_451_999;

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

function defaultRows(url: URL): object[] {
  const params = url.searchParams;
  switch (url.pathname) {
    case bucketsPath:
      return [{ bucketId }];
    case activitiesPath: {
      const types = params.get('activity_types') ?? '';
      if (params.has('granularity')) {
        return bucketBounds.map(([startDate, endDate], index) => ({
          startDate,
          endDate,
          activityCount: seriesCounts[types]?.[index],
        }));
      }
      const period = params.get('startDate') === currentRange.startDate ? 'current' : 'previous';
      return [{ activityCount: summaryCounts[types]?.[period] }];
    }
    case velocityPath:
      return [{ averagePullRequestResolveVelocitySeconds: resolveSeconds }];
    default:
      throw new Error(`unexpected Tinybird path ${url.pathname}`);
  }
}

// Routes the stubbed fetch by pipe; a test passes its own `rowsFor` to change some pipes' rows.
const tinybird =
  (rowsFor: (url: URL) => object[] = defaultRows) =>
  async (input: unknown) =>
    tinybirdResponse(rowsFor(new URL(String(input))));

const calls = () => mockFetch.mock.calls.map((call) => new URL(String(call[0])));
const pipeCalls = () => calls().filter((url) => url.pathname !== bucketsPath);

const describeCall = (url: URL) => ({
  pipe: url.pathname,
  activityTypes: url.searchParams.get('activity_types'),
  granularity: url.searchParams.get('granularity'),
  startDate: url.searchParams.get('startDate'),
  endDate: url.searchParams.get('endDate'),
});

const periodFrom = '2025-01-01T00:00:00Z';
const periodTo = '2025-03-31T00:00:00Z';

const zeroSummary = {
  current: 0,
  previous: 0,
  percentageChange: 0,
  changeValue: 0,
  periodFrom,
  periodTo,
};

const emptyBody = {
  openedSummary: zeroSummary,
  mergedSummary: zeroSummary,
  closedSummary: zeroSummary,
  avgResolveTimeSeconds: null,
  data: [],
};

interface OpenApiSchema {
  type?: string;
  description?: string;
  nullable?: boolean;
  format?: string;
  enum?: string[];
  default?: string;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
}

interface OpenApiOperation {
  tags?: string[];
  description?: string;
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
  mockFetch.mockReset().mockImplementation(tinybird());
});

const get = (url: string) => app.inject({ method: 'GET', url });

describe('GET /v1-alpha/projects/{slug}/development/pull-requests (AC1)', () => {
  it('returns the three summaries, the resolve time and the series', async () => {
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      openedSummary: {
        current: 100,
        previous: 50,
        percentageChange: 100,
        changeValue: 50,
        periodFrom,
        periodTo,
      },
      mergedSummary: {
        current: 25,
        previous: 40,
        percentageChange: -37.5,
        changeValue: -15,
        periodFrom,
        periodTo,
      },
      closedSummary: {
        current: 10,
        previous: 5,
        percentageChange: 100,
        changeValue: 5,
        periodFrom,
        periodTo,
      },
      avgResolveTimeSeconds: resolveSeconds,
      data: [
        {
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-01-05T00:00:00Z',
          open: 11,
          merged: 8,
          closed: 2,
        },
        {
          startDate: '2025-01-06T00:00:00Z',
          endDate: '2025-01-12T00:00:00Z',
          open: 4,
          merged: 1,
          closed: 1,
        },
        {
          startDate: '2025-01-13T00:00:00Z',
          endDate: '2025-01-19T00:00:00Z',
          open: 7,
          merged: 6,
          closed: 3,
        },
      ],
    });
  });

  it('counts a bucket the merged or closed series lacks as 0', async () => {
    mockFetch.mockImplementation(
      tinybird((url) => {
        const rows = defaultRows(url);
        const types = url.searchParams.get('activity_types');
        return url.searchParams.has('granularity') && types === mergedTypes
          ? rows.slice(0, 2)
          : rows;
      }),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.json().data.map((bucket: { merged: number }) => bucket.merged)).toEqual([8, 1, 0]);
  });

  it('keeps merged and closed counts with their bucket when a middle bucket is missing', async () => {
    mockFetch.mockImplementation(
      tinybird((url) => {
        const rows = defaultRows(url);
        const isOpenedSeries = url.searchParams.get('activity_types') === openedTypes;
        return url.searchParams.has('granularity') && !isOpenedSeries
          ? rows.filter((_, index) => index !== 1)
          : rows;
      }),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(200);
    expect(
      res
        .json()
        .data.map((bucket: { merged: number; closed: number }) => [bucket.merged, bucket.closed]),
    ).toEqual([
      [8, 2],
      [0, 0],
      [6, 3],
    ]);
  });

  it('keeps a bucket only the merged and closed series report, in date order', async () => {
    mockFetch.mockImplementation(
      tinybird((url) => {
        const rows = defaultRows(url);
        const isOpenedSeries =
          url.searchParams.has('granularity') &&
          url.searchParams.get('activity_types') === openedTypes;
        return isOpenedSeries ? rows.filter((_, index) => index !== 1) : rows;
      }),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      {
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-05T00:00:00Z',
        open: 11,
        merged: 8,
        closed: 2,
      },
      {
        startDate: '2025-01-06T00:00:00Z',
        endDate: '2025-01-12T00:00:00Z',
        open: 0,
        merged: 1,
        closed: 1,
      },
      {
        startDate: '2025-01-13T00:00:00Z',
        endDate: '2025-01-19T00:00:00Z',
        open: 7,
        merged: 6,
        closed: 3,
      },
    ]);
  });

  it('formats DateTime bucket bounds the same way as Date bounds', async () => {
    mockFetch.mockImplementation(
      tinybird((url) => {
        const isOpenedSeries =
          url.searchParams.has('granularity') &&
          url.searchParams.get('activity_types') === openedTypes;
        return isOpenedSeries
          ? [
              {
                startDate: '2025-01-01 00:00:00',
                endDate: '2025-01-05 23:59:59',
                activityCount: 11,
              },
            ]
          : defaultRows(url);
      }),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(200);
    const [first, ...rest] = res.json().data;
    expect(first).toEqual({
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-01-05T23:59:59Z',
      open: 11,
      merged: 8,
      closed: 2,
    });
    expect(rest.map((bucket: { open: number }) => bucket.open)).toEqual([0, 0]);
  });
});

describe('Tinybird calls (AC2, AC3)', () => {
  it('looks the bucket up once, then makes the ten pipe calls with it', async () => {
    await get(`${route}?${rangeQuery}`);
    expect(calls()).toHaveLength(11);

    const [lookup] = calls();
    expect(lookup?.origin).toBe(tinybirdHost);
    expect(lookup?.pathname).toBe(bucketsPath);
    expect(lookup?.searchParams.get('project')).toBe('kubernetes');
    expect(lookup?.searchParams.has('bucketId')).toBe(false);

    for (const url of pipeCalls()) {
      expect(url.origin).toBe(tinybirdHost);
      expect(url.searchParams.get('project')).toBe('kubernetes');
      expect(url.searchParams.get('bucketId')).toBe(String(bucketId));
      expect(url.searchParams.get('onlyContributions')).toBe('false');
      expect(url.searchParams.get('includeCodeContributions')).toBe('true');
      expect(url.searchParams.get('includeCollaborations')).toBe('true');
      expect(url.searchParams.has('repos')).toBe(false);
    }

    const summaries = activityGroups.flatMap((activityTypes) => [
      { pipe: activitiesPath, activityTypes, granularity: null, ...currentRange },
      { pipe: activitiesPath, activityTypes, granularity: null, ...previousRange },
    ]);
    const series = activityGroups.map((activityTypes) => ({
      pipe: activitiesPath,
      activityTypes,
      granularity: 'weekly',
      ...currentRange,
    }));
    const velocity = {
      pipe: velocityPath,
      activityTypes: null,
      granularity: null,
      ...currentRange,
    };
    const described = pipeCalls().map(describeCall);
    expect(described).toHaveLength(10);
    expect(described).toEqual(expect.arrayContaining([...summaries, ...series, velocity]));
  });

  it('dispatches the ten pipe calls concurrently', async () => {
    let started = 0;
    let release: () => void = () => {};
    const allStarted = new Promise<void>((resolve) => {
      release = resolve;
    });
    mockFetch.mockImplementation(async (input: unknown) => {
      const url = new URL(String(input));
      if (url.pathname !== bucketsPath) {
        started += 1;
        if (started === 10) {
          release();
        }
        // A sequential implementation never reaches the tenth call and times out here.
        await allStarted;
      }
      return tinybirdResponse(defaultRows(url));
    });
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(200);
    expect(started).toBe(10);
  }, 2000);
});

describe('repos filter (AC4)', () => {
  it('passes repeated repos to every pipe call as one comma-joined value', async () => {
    const repos = `repos=${encodeURIComponent(k8sRepo)}&repos=${encodeURIComponent(websiteRepo)}`;
    await get(`${route}?${rangeQuery}&${repos}`);
    expect(pipeCalls()).toHaveLength(10);
    for (const url of pipeCalls()) {
      expect(url.searchParams.get('repos')).toBe(`${k8sRepo},${websiteRepo}`);
    }
    expect(calls()[0]?.searchParams.has('repos')).toBe(false);
  });

  it('passes a single repos value through unchanged', async () => {
    await get(`${route}?${rangeQuery}&repos=${encodeURIComponent(k8sRepo)}`);
    expect(pipeCalls()).toHaveLength(10);
    for (const url of pipeCalls()) {
      expect(url.searchParams.get('repos')).toBe(k8sRepo);
    }
  });

  it('drops an empty repos value instead of sending a filter that matches nothing', async () => {
    const res = await get(`${route}?${rangeQuery}&repos=`);
    expect(res.statusCode).toBe(200);
    expect(pipeCalls()).toHaveLength(10);
    for (const url of pipeCalls()) {
      expect(url.searchParams.has('repos')).toBe(false);
    }
  });

  it('keeps the other repos values when one of them is empty', async () => {
    await get(`${route}?${rangeQuery}&repos=&repos=${encodeURIComponent(k8sRepo)}`);
    expect(pipeCalls()).toHaveLength(10);
    for (const url of pipeCalls()) {
      expect(url.searchParams.get('repos')).toBe(k8sRepo);
    }
  });
});

describe('defaults (AC5)', () => {
  it('defaults the range to 2010-01-01 through today', async () => {
    // The handler derives "today" at request time, so a run crossing UTC midnight
    // may see either the day before or after this call; accept both.
    const before = new Date().toISOString().slice(0, 10);
    const res = await get(`${route}?granularity=weekly`);
    const after = new Date().toISOString().slice(0, 10);
    const days = [before, after];
    expect(res.statusCode).toBe(200);

    const series = pipeCalls().filter((url) => url.searchParams.has('granularity'));
    expect(series).toHaveLength(3);
    for (const url of series) {
      expect(url.searchParams.get('granularity')).toBe('weekly');
    }

    const current = pipeCalls().filter(
      (url) => url.searchParams.get('startDate') === '2010-01-01 00:00:00',
    );
    expect(current).toHaveLength(7);
    for (const url of current) {
      expect(days.map((d) => `${d} 00:00:00`)).toContain(url.searchParams.get('endDate'));
    }

    const body = res.json();
    for (const key of ['openedSummary', 'mergedSummary', 'closedSummary']) {
      expect(body[key].periodFrom).toBe('2010-01-01T00:00:00Z');
      expect(days.map((d) => `${d}T00:00:00Z`)).toContain(body[key].periodTo);
    }
  });
});

describe('unknown slug and empty data (AC6, AC7)', () => {
  beforeEach(() => {
    // The Tinybird client warns when the bucket lookup finds no row; keep the output readable.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns zero summaries and an empty series for a slug with no bucket, after one call', async () => {
    mockFetch.mockImplementation(tinybird(() => []));
    const res = await get(
      '/v1-alpha/projects/no-such-project/development/pull-requests?' + rangeQuery,
    );
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
    expect(calls()).toHaveLength(1);
    expect(calls()[0]?.pathname).toBe(bucketsPath);
  });

  it('returns the same zero shape when every pipe has no rows', async () => {
    mockFetch.mockImplementation(
      tinybird((url) => (url.pathname === bucketsPath ? [{ bucketId }] : [])),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
  });

  it('returns a null resolve time when only the velocity pipe has no rows', async () => {
    mockFetch.mockImplementation(
      tinybird((url) => (url.pathname === velocityPath ? [] : defaultRows(url))),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      avgResolveTimeSeconds: null,
      openedSummary: { current: 100 },
    });
    expect(res.json().data).toHaveLength(3);
  });

  it('reports percentageChange null when the previous period has no rows', async () => {
    mockFetch.mockImplementation(
      tinybird((url) =>
        url.searchParams.get('startDate') === previousRange.startDate ? [] : defaultRows(url),
      ),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.json().openedSummary).toMatchObject({
      current: 100,
      previous: 0,
      percentageChange: null,
    });
  });
});

describe('request validation (AC8)', () => {
  it('returns 400 invalid_request for an inverted range without calling Tinybird', async () => {
    const res = await get(`${route}?granularity=weekly&startDate=2025-03-31&endDate=2025-01-01`);
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('invalid_request');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it.each([
    ['startDate=2025-01-01&endDate=2025-03-31'],
    ['granularity=hourly'],
    ['startDate=2025-01-01T00%3A00%3A00Z'],
    ['endDate=yesterday'],
  ])('rejects %s with 400', async (query) => {
    const res = await get(`${route}?${query}`);
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('Tinybird failures (AC9)', () => {
  const upstreamDetail = 'tinybird internal detail';

  beforeEach(() => {
    // The Tinybird client logs every failed request; keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const failing =
    (path: string, respond: () => Response | Promise<Response>) => async (input: unknown) => {
      const url = new URL(String(input));
      return url.pathname === path ? respond() : tinybirdResponse(defaultRows(url));
    };

  it('maps a failed bucket lookup to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(
      failing(bucketsPath, () => new Response(upstreamDetail, { status: 500 })),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it.each([
    [500, 'Internal Server Error'],
    [401, 'Unauthorized'],
    [429, 'Too Many Requests'],
  ])('maps a pipe %i to 503 upstream_unavailable', async (status, statusText) => {
    mockFetch.mockImplementation(
      failing(activitiesPath, () => new Response(upstreamDetail, { status, statusText })),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
    expect(res.body).not.toContain(String(status));
  });

  it('maps a network error to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(
      failing(velocityPath, () => Promise.reject(new TypeError(`fetch failed: ${upstreamDetail}`))),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a response that is not JSON to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(
      failing(activitiesPath, () => new Response('<html>oops</html>', { status: 200 })),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
  });

  it('keeps Cache-Control: private, max-age=0 on the 503', async () => {
    mockFetch.mockImplementation(
      failing(activitiesPath, () => new Response(upstreamDetail, { status: 500 })),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(503);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });
});

describe('caching headers (AC10)', () => {
  it('sets Cache-Control: private, max-age=0 on a successful response', async () => {
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });
});

describe('OpenAPI spec (AC11)', () => {
  const routePath = '/v1-alpha/projects/{slug}/development/pull-requests';

  async function getOperation(): Promise<OpenApiOperation> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    const operation = res.json<OpenApiDoc>().paths[routePath]?.get;
    expect(operation, `${routePath} is missing from the spec`).toBeDefined();
    return operation as OpenApiOperation;
  }

  it('tags the route Development and states the Tinybird call count', async () => {
    const operation = await getOperation();
    expect(operation.tags).toEqual(['Development']);
    expect(operation.description).toMatch(/11 Tinybird calls/);
  });

  it('shows granularity as a required enum query parameter', async () => {
    const operation = await getOperation();
    const param = operation.parameters?.find((p) => p.name === 'granularity');
    expect(param?.in).toBe('query');
    expect(param?.required).toBe(true);
    expect(param?.schema.enum).toEqual(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
    expect(param?.schema).not.toHaveProperty('default');
  });

  it('documents every field this route defines, with the resolve time nullable', async () => {
    const operation = await getOperation();
    const schema = operation.responses['200']?.content['application/json']?.schema;
    const fields = [
      'openedSummary',
      'mergedSummary',
      'closedSummary',
      'avgResolveTimeSeconds',
      'data',
    ];
    expect(schema?.required).toEqual(expect.arrayContaining(fields));
    for (const field of fields) {
      expect(schema?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    expect(schema?.properties?.avgResolveTimeSeconds).toMatchObject({
      type: 'number',
      nullable: true,
    });

    const summaryFields = [
      'current',
      'previous',
      'percentageChange',
      'changeValue',
      'periodFrom',
      'periodTo',
    ];
    for (const key of ['openedSummary', 'mergedSummary', 'closedSummary']) {
      const summary = schema?.properties?.[key];
      expect(summary?.required).toEqual(expect.arrayContaining(summaryFields));
      for (const field of summaryFields) {
        expect(
          summary?.properties?.[field]?.description,
          `${key}.${field} has no description`,
        ).toBeTruthy();
      }
      expect(summary?.properties?.percentageChange?.nullable).toBe(true);
      expect(summary?.properties?.periodFrom?.format).toBe('date-time');
    }

    const bucket = schema?.properties?.data?.items;
    const bucketFields = ['startDate', 'endDate', 'open', 'merged', 'closed'];
    expect(bucket?.required).toEqual(expect.arrayContaining(bucketFields));
    for (const field of bucketFields) {
      expect(bucket?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    expect(bucket?.properties?.startDate?.format).toBe('date-time');
    expect(bucket?.properties?.endDate?.format).toBe('date-time');
  });

  it('keeps the route out of /v1', async () => {
    const res = await get('/v1/openapi.json');
    expect(res.statusCode).toBe(200);
    expect(Object.keys(res.json<OpenApiDoc>().paths)).not.toContain(routePath);
    const v1 = await get('/v1/projects/kubernetes/development/pull-requests');
    expect(v1.statusCode).toBe(404);
  });
});

describe('response shape (AC12)', () => {
  it('drops pipe fields the contract does not list', async () => {
    mockFetch.mockImplementation(
      tinybird((url) => {
        const rows = defaultRows(url);
        if (url.pathname === velocityPath) {
          return rows.map((row) => ({ ...row, sampleSize: 42 }));
        }
        if (url.pathname === activitiesPath && url.searchParams.has('granularity')) {
          return rows.map((row) => ({ ...row, cumulativeActivityCount: 999 }));
        }
        return rows;
      }),
    );
    const res = await get(`${route}?${rangeQuery}`);
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(
      ['avgResolveTimeSeconds', 'closedSummary', 'data', 'mergedSummary', 'openedSummary'].sort(),
    );
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(
        ['closed', 'endDate', 'merged', 'open', 'startDate'].sort(),
      );
    }
  });
});
