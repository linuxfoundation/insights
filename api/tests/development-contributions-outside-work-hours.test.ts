// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildApp } from '../src/app.js';
import { getTinybirdClient } from '../src/clients/tinybird.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const pipePath = '/v0/pipes/activity_heatmap_by_weekday_and_2hours_blocks.json';
const bucketsPath = '/v0/pipes/project_buckets.json';
const route = '/v1-alpha/projects/kubernetes/development/contributions-outside-work-hours';
const currentRange = '?startDate=2025-01-01&endDate=2025-03-31';
const currentStart = '2025-01-01 00:00:00';
const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';

interface PipeRow {
  weekday: number;
  twoHoursBlock: number;
  activityCount: number;
}

interface Summary {
  current: number;
  previous: number;
  percentageChange: number | null;
  changeValue: number;
  periodFrom: string;
  periodTo: string;
}

interface Body {
  summary: Summary;
  weekdayOutsideHoursPercentage: number;
  weekendOutsideHoursPercentage: number;
  data: { weekday: number; hour: number; contributions: number }[];
}

const cell = (weekday: number, twoHoursBlock: number, activityCount: number): PipeRow => ({
  weekday,
  twoHoursBlock,
  activityCount,
});

// Current period: 100 contributions, 40 on weekdays outside work hours, 10 on the weekend.
const currentRows = [cell(1, 20, 30), cell(2, 10, 50), cell(3, 6, 10), cell(6, 12, 10)];
// Previous period: 100 contributions, 40 outside work hours, all of them on the weekend.
const previousRows = [cell(1, 10, 60), cell(7, 14, 40)];
// Tuesday noon, inside work hours: gives the one-cell fixtures a total to divide by.
const filler = cell(2, 12, 1);

const tinybirdBody = (rows: object[]) =>
  new Response(
    JSON.stringify({
      data: rows,
      meta: [],
      rows: rows.length,
      statistics: { elapsed: 0.01, rows_read: 1, bytes_read: 1 },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );

interface PipeFixture {
  current: object[];
  previous: object[];
  start?: string;
  buckets?: object[];
}

// The two heatmap calls run concurrently, so the stub routes by pipe and by startDate
// instead of by call order.
function stubTinybird({
  current,
  previous,
  start = currentStart,
  buckets = [{ bucketId: 1 }],
}: PipeFixture) {
  mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    if (url.pathname === bucketsPath) {
      return tinybirdBody(buckets);
    }
    return tinybirdBody(url.searchParams.get('startDate') === start ? current : previous);
  });
}

const calledUrls = () => mockFetch.mock.calls.map((call) => new URL(String(call[0])));
const callsTo = (path: string) => calledUrls().filter((url) => url.pathname === path);
const pipeCalls = () => callsTo(pipePath);

interface OpenApiSchema {
  $ref?: string;
  type?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
}

interface OpenApiParameter {
  name: string;
  in: string;
  required?: boolean;
  schema?: { type?: string; default?: unknown };
}

interface OpenApiOperation {
  tags?: string[];
  description?: string;
  parameters?: OpenApiParameter[];
  responses: Record<string, { content: Record<string, { schema: OpenApiSchema }> }>;
}

interface OpenApiDoc {
  paths: Record<string, { get?: OpenApiOperation }>;
  components?: { schemas?: Record<string, OpenApiSchema> };
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
  stubTinybird({ current: currentRows, previous: previousRows });
});

const get = (url: string) => app.inject({ method: 'GET', url });
const getBody = async (url: string) => (await get(url)).json<Body>();

describe('GET /v1-alpha/projects/{slug}/development/contributions-outside-work-hours (AC1)', () => {
  it('returns the outside-hours summary, the weekday and weekend shares and the heatmap', async () => {
    const res = await get(`${route}${currentRange}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: {
        current: 50,
        previous: 40,
        percentageChange: 25,
        changeValue: 10,
        periodFrom: '2025-01-01T00:00:00Z',
        periodTo: '2025-03-31T00:00:00Z',
      },
      weekdayOutsideHoursPercentage: 40,
      weekendOutsideHoursPercentage: 10,
      data: [
        { weekday: 1, hour: 20, contributions: 30 },
        { weekday: 2, hour: 10, contributions: 50 },
        { weekday: 3, hour: 6, contributions: 10 },
        { weekday: 6, hour: 12, contributions: 10 },
      ],
    });
  });

  it('returns only the documented keys and drops extra pipe fields', async () => {
    stubTinybird({
      current: currentRows.map((row) => ({ ...row, extra: 'dropped' })),
      previous: previousRows,
    });
    const body = await getBody(`${route}${currentRange}`);
    expect(Object.keys(body).sort()).toEqual(
      ['data', 'summary', 'weekdayOutsideHoursPercentage', 'weekendOutsideHoursPercentage'].sort(),
    );
    expect(Object.keys(body.summary).sort()).toEqual(
      ['changeValue', 'current', 'percentageChange', 'periodFrom', 'periodTo', 'previous'].sort(),
    );
    for (const item of body.data) {
      expect(Object.keys(item).sort()).toEqual(['contributions', 'hour', 'weekday']);
    }
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes one heatmap call per period with the slug as project and Tinybird datetimes', async () => {
    const repos = `&repos=${encodeURIComponent(k8sRepo)}&repos=${encodeURIComponent(websiteRepo)}`;
    const res = await get(`${route}${currentRange}${repos}`);
    expect(res.statusCode).toBe(200);

    expect(callsTo(bucketsPath)).toHaveLength(1);
    const calls = pipeCalls();
    expect(calls).toHaveLength(2);
    for (const url of calls) {
      expect(url.origin).toBe(tinybirdHost);
      expect(url.searchParams.get('project')).toBe('kubernetes');
      expect(url.searchParams.get('bucketId')).toBe('1');
      expect(url.searchParams.get('repos')).toBe(`${k8sRepo},${websiteRepo}`);
    }
    const ranges = calls.map((url) => [
      url.searchParams.get('startDate'),
      url.searchParams.get('endDate'),
    ]);
    expect(ranges).toEqual(
      expect.arrayContaining([
        ['2025-01-01 00:00:00', '2025-03-31 00:00:00'],
        ['2024-10-01 00:00:00', '2024-12-31 00:00:00'],
      ]),
    );
  });

  it('starts both heatmap calls before either resolves', async () => {
    const inFlight = new Set<string>();
    let release!: () => void;
    const bothInFlight = new Promise<void>((resolve) => {
      release = resolve;
    });
    mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.pathname === bucketsPath) {
        return tinybirdBody([{ bucketId: 1 }]);
      }
      const start = url.searchParams.get('startDate') ?? '';
      inFlight.add(start);
      if (inFlight.size === 2) {
        release();
      }
      // A sequential implementation never issues the second call while the first is pending,
      // so the first call times out (and its retry does too) instead of resolving.
      await Promise.race([
        bothInFlight,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('only one heatmap call in flight')), 300),
        ),
      ]);
      return tinybirdBody(start === currentStart ? currentRows : previousRows);
    });

    const res = await get(`${route}${currentRange}`);
    expect(res.statusCode).toBe(200);
    expect(res.json<Body>().summary).toMatchObject({ current: 50, previous: 40 });
  });
});

describe('includeCollaborations and includeCodeContributions (AC3)', () => {
  it('defaults to includeCollaborations=false and includeCodeContributions=true on both calls', async () => {
    await get(`${route}${currentRange}`);
    const calls = pipeCalls();
    expect(calls).toHaveLength(2);
    for (const url of calls) {
      expect(url.searchParams.get('includeCollaborations')).toBe('false');
      expect(url.searchParams.get('includeCodeContributions')).toBe('true');
    }
  });

  it('coerces ?includeCollaborations=true and passes it to both calls', async () => {
    const res = await get(`${route}${currentRange}&includeCollaborations=true`);
    expect(res.statusCode).toBe(200);
    const calls = pipeCalls();
    expect(calls).toHaveLength(2);
    for (const url of calls) {
      expect(url.searchParams.get('includeCollaborations')).toBe('true');
    }
  });

  it('coerces ?includeCodeContributions=false and passes it to both calls', async () => {
    const res = await get(`${route}${currentRange}&includeCodeContributions=false`);
    expect(res.statusCode).toBe(200);
    const calls = pipeCalls();
    expect(calls).toHaveLength(2);
    for (const url of calls) {
      expect(url.searchParams.get('includeCodeContributions')).toBe('false');
    }
  });

  it('rejects a non-boolean includeCollaborations with 400', async () => {
    const res = await get(`${route}${currentRange}&includeCollaborations=maybe`);
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('work-hours definition (AC4)', () => {
  it.each([0, 2, 4, 6, 18, 20, 22])(
    'counts a weekday contribution in the block starting at %i as outside work hours',
    async (block) => {
      stubTinybird({ current: [cell(5, block, 1), filler], previous: [] });
      const body = await getBody(`${route}${currentRange}`);
      expect(body.weekdayOutsideHoursPercentage).toBe(50);
      expect(body.weekendOutsideHoursPercentage).toBe(0);
      expect(body.summary.current).toBe(50);
    },
  );

  it.each([8, 10, 12, 14, 16])(
    'counts a weekday contribution in the block starting at %i as work hours',
    async (block) => {
      stubTinybird({ current: [cell(1, block, 1), filler], previous: [] });
      const body = await getBody(`${route}${currentRange}`);
      expect(body.weekdayOutsideHoursPercentage).toBe(0);
      expect(body.weekendOutsideHoursPercentage).toBe(0);
      expect(body.summary.current).toBe(0);
    },
  );

  it.each([6, 7])('counts every block on weekday %i as weekend', async (weekday) => {
    stubTinybird({
      current: [cell(weekday, 12, 1), cell(weekday, 2, 1), filler, filler],
      previous: [],
    });
    const body = await getBody(`${route}${currentRange}`);
    expect(body.weekendOutsideHoursPercentage).toBe(50);
    expect(body.weekdayOutsideHoursPercentage).toBe(0);
    expect(body.summary.current).toBe(50);
  });

  it('adds the weekday and weekend shares up to the summary share', async () => {
    stubTinybird({ current: [cell(1, 20, 1), cell(6, 12, 1), filler, filler], previous: [] });
    const body = await getBody(`${route}${currentRange}`);
    expect(body.weekdayOutsideHoursPercentage).toBe(25);
    expect(body.weekendOutsideHoursPercentage).toBe(25);
    expect(body.summary.current).toBe(50);
  });
});

describe('signed percentageChange (AC5)', () => {
  it('reports a drop as a negative percentageChange and changeValue', async () => {
    stubTinybird({ current: previousRows, previous: currentRows });
    const body = await getBody(`${route}${currentRange}`);
    expect(body.summary).toMatchObject({
      current: 40,
      previous: 50,
      percentageChange: -20,
      changeValue: -10,
    });
  });

  it('returns null when the previous share is 0 and the current share is not', async () => {
    stubTinybird({ current: currentRows, previous: [cell(1, 10, 60)] });
    const body = await getBody(`${route}${currentRange}`);
    expect(body.summary).toMatchObject({
      current: 50,
      previous: 0,
      percentageChange: null,
      changeValue: 50,
    });
  });

  it('returns 0 when both shares are 0', async () => {
    stubTinybird({ current: [cell(2, 10, 50)], previous: [cell(1, 10, 60)] });
    const body = await getBody(`${route}${currentRange}`);
    expect(body.summary).toMatchObject({
      current: 0,
      previous: 0,
      percentageChange: 0,
      changeValue: 0,
    });
  });
});

describe('empty pipe results (AC6)', () => {
  it('returns zeros and an empty heatmap when the pipe has no rows', async () => {
    stubTinybird({ current: [], previous: [] });
    const res = await get(`${route}${currentRange}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: {
        current: 0,
        previous: 0,
        percentageChange: 0,
        changeValue: 0,
        periodFrom: '2025-01-01T00:00:00Z',
        periodTo: '2025-03-31T00:00:00Z',
      },
      weekdayOutsideHoursPercentage: 0,
      weekendOutsideHoursPercentage: 0,
      data: [],
    });
  });

  it('echoes zero-count cells and reports zero shares', async () => {
    stubTinybird({ current: [cell(1, 20, 0), cell(6, 12, 0)], previous: [] });
    const body = await getBody(`${route}${currentRange}`);
    expect(body.summary).toMatchObject({ current: 0, previous: 0, percentageChange: 0 });
    expect(body.weekdayOutsideHoursPercentage).toBe(0);
    expect(body.weekendOutsideHoursPercentage).toBe(0);
    expect(body.data).toEqual([
      { weekday: 1, hour: 20, contributions: 0 },
      { weekday: 6, hour: 12, contributions: 0 },
    ]);
  });
});

describe('unknown slug (AC7)', () => {
  beforeEach(() => {
    // The bucket cache logs a warning for a slug without a bucket; keep the test output readable.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with zeros and an empty heatmap when the bucket lookup has no row', async () => {
    stubTinybird({ current: currentRows, previous: previousRows, buckets: [] });
    const res = await get(
      `/v1-alpha/projects/no-such-project/development/contributions-outside-work-hours${currentRange}`,
    );
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: {
        current: 0,
        previous: 0,
        percentageChange: 0,
        changeValue: 0,
        periodFrom: '2025-01-01T00:00:00Z',
        periodTo: '2025-03-31T00:00:00Z',
      },
      weekdayOutsideHoursPercentage: 0,
      weekendOutsideHoursPercentage: 0,
      data: [],
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(callsTo(bucketsPath)[0]?.searchParams.get('project')).toBe('no-such-project');
    expect(pipeCalls()).toHaveLength(0);
  });
});

describe('date validation and defaults (AC8)', () => {
  it('rejects a timestamp in startDate with 400', async () => {
    const res = await get(`${route}?startDate=2025-01-01T00:00:00Z&endDate=2025-03-31`);
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects an inverted range with 400 invalid_request before calling Tinybird', async () => {
    const res = await get(`${route}?startDate=2025-03-31&endDate=2025-01-01`);
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('invalid_request');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('defaults the period to 2010-01-01 through today when both dates are omitted', async () => {
    const before = new Date().toISOString().slice(0, 10);
    stubTinybird({ current: currentRows, previous: previousRows, start: '2010-01-01 00:00:00' });
    const res = await get(route);
    const after = new Date().toISOString().slice(0, 10);
    expect(res.statusCode).toBe(200);
    const { summary } = res.json<Body>();
    expect(summary).toMatchObject({
      current: 50,
      previous: 40,
      periodFrom: '2010-01-01T00:00:00Z',
    });
    // The handler reads the clock after this request starts, so a run that crosses UTC
    // midnight can land on either day.
    expect([before, after].map((d) => `${d}T00:00:00Z`)).toContain(summary.periodTo);
    const today = summary.periodTo.slice(0, 10);
    const ranges = pipeCalls().map((url) => [
      url.searchParams.get('startDate'),
      url.searchParams.get('endDate'),
    ]);
    expect(ranges).toContainEqual(['2010-01-01 00:00:00', `${today} 00:00:00`]);
  });
});

describe('Tinybird failures (AC9)', () => {
  const upstreamDetail = 'tinybird internal detail';

  const failPipe = (response: () => Response) =>
    mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      return url.pathname === bucketsPath ? tinybirdBody([{ bucketId: 1 }]) : response();
    });

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
  ])('maps a heatmap pipe %i to 503 upstream_unavailable', async (status, statusText) => {
    failPipe(() => new Response(upstreamDetail, { status, statusText }));
    const res = await get(`${route}${currentRange}`);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a bucket lookup 500 to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(
      async () =>
        new Response(upstreamDetail, { status: 500, statusText: 'Internal Server Error' }),
    );
    const res = await get(`${route}${currentRange}`);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a network error to 503 upstream_unavailable', async () => {
    mockFetch.mockRejectedValue(new TypeError(`fetch failed: ${upstreamDetail}`));
    const res = await get(`${route}${currentRange}`);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a response that is not JSON to 503 upstream_unavailable', async () => {
    failPipe(() => new Response('<html>oops</html>', { status: 200 }));
    const res = await get(`${route}${currentRange}`);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
  });

  it('sets Cache-Control: private, max-age=0 on the 503 (AC10)', async () => {
    mockFetch.mockRejectedValue(new TypeError('fetch failed'));
    const res = await get(`${route}${currentRange}`);
    expect(res.statusCode).toBe(503);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });
});

describe('caching headers (AC10)', () => {
  it('sets Cache-Control: private, max-age=0 on a successful response', async () => {
    const res = await get(`${route}${currentRange}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });
});

describe('/v1-alpha registration and spec (AC11)', () => {
  const routePath = '/v1-alpha/projects/{slug}/development/contributions-outside-work-hours';

  async function getSpec(url: string): Promise<OpenApiDoc> {
    const res = await get(url);
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>();
  }

  // Swagger may hoist a titled object schema into components and leave a $ref behind.
  function resolve(spec: OpenApiDoc, schema: OpenApiSchema | undefined): OpenApiSchema | undefined {
    const name = schema?.$ref?.split('/').pop();
    return name ? spec.components?.schemas?.[name] : schema;
  }

  function expectDescribed(schema: OpenApiSchema | undefined, fields: string[]) {
    expect(schema?.required).toEqual(expect.arrayContaining(fields));
    for (const field of fields) {
      expect(schema?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
  }

  it('lists the route under Development with the work-hours definition and timezone', async () => {
    const spec = await getSpec('/v1-alpha/openapi.json');
    const operation = spec.paths[routePath]?.get;
    expect(operation?.tags).toEqual(['Development']);
    expect(operation?.description).toMatch(/18:00/);
    expect(operation?.description).toMatch(/08:00/);
    expect(operation?.description).toMatch(/local time/i);
  });

  it('documents every field of the 200 response', async () => {
    const spec = await getSpec('/v1-alpha/openapi.json');
    const schema = resolve(
      spec,
      spec.paths[routePath]?.get?.responses['200']?.content['application/json']?.schema,
    );
    expectDescribed(schema, [
      'summary',
      'weekdayOutsideHoursPercentage',
      'weekendOutsideHoursPercentage',
      'data',
    ]);
    expectDescribed(resolve(spec, schema?.properties?.summary), [
      'current',
      'previous',
      'percentageChange',
      'changeValue',
      'periodFrom',
      'periodTo',
    ]);
    expectDescribed(resolve(spec, schema?.properties?.data?.items), [
      'weekday',
      'hour',
      'contributions',
    ]);
  });

  it('lists the query params, with both booleans optional and defaulted', async () => {
    const spec = await getSpec('/v1-alpha/openapi.json');
    const parameters = spec.paths[routePath]?.get?.parameters ?? [];
    const query = Object.fromEntries(
      parameters.filter((param) => param.in === 'query').map((param) => [param.name, param]),
    );
    expect(Object.keys(query).sort()).toEqual(
      ['endDate', 'includeCodeContributions', 'includeCollaborations', 'repos', 'startDate'].sort(),
    );
    expect(query.includeCollaborations?.required).toBeFalsy();
    expect(query.includeCollaborations?.schema).toMatchObject({ type: 'boolean', default: false });
    expect(query.includeCodeContributions?.required).toBeFalsy();
    expect(query.includeCodeContributions?.schema).toMatchObject({
      type: 'boolean',
      default: true,
    });
  });

  it('keeps the route out of /v1', async () => {
    const spec = await getSpec('/v1/openapi.json');
    expect(Object.keys(spec.paths)).not.toContain(routePath);
    const res = await get(
      `/v1/projects/kubernetes/development/contributions-outside-work-hours${currentRange}`,
    );
    expect(res.statusCode).toBe(404);
  });
});

describe('repos filter', () => {
  it('drops an empty repos value instead of sending a filter that matches nothing', async () => {
    const res = await get(`${route}${currentRange}&repos=`);
    expect(res.statusCode).toBe(200);
    expect(pipeCalls()).toHaveLength(2);
    for (const url of pipeCalls()) {
      expect(url.searchParams.has('repos')).toBe(false);
    }
  });

  it('keeps the other repos values when one of them is empty', async () => {
    await get(`${route}${currentRange}&repos=&repos=${encodeURIComponent(k8sRepo)}`);
    expect(pipeCalls()).toHaveLength(2);
    for (const url of pipeCalls()) {
      expect(url.searchParams.get('repos')).toBe(k8sRepo);
    }
  });
});
