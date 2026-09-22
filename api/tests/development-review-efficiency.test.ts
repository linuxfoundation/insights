// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  atDate,
  developmentPath,
  mockFetch,
  parameterDescription,
  pipeCalls,
  queryString,
  tinybirdHost,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
  type OpenApiOperation,
  type OpenApiSchema,
} from './helpers/tinybird.js';

const startDate = '2025-01-01';
const endDate = '2025-03-31';
const previousStart = '2024-10-01';
const previousEnd = '2024-12-31';
const atMidnight = (day: string) => `${day} 00:00:00`;
const isoDay = (day: string) => `${day}T00:00:00Z`;

const platforms = ['github', 'gitlab', 'gerrit'];

const currentRow = { openedCount: 80, resolvedCount: 60 };
const previousRow = { openedCount: 50, resolvedCount: 40 };
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', openedCount: 30, resolvedCount: 20 },
  { startDate: '2025-02-01', endDate: '2025-02-28', openedCount: 25, resolvedCount: 20 },
  { startDate: '2025-03-01', endDate: '2025-03-31', openedCount: 25, resolvedCount: 20 },
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
const bodyKeys = ['closedSummary', 'data', 'efficiencyPercentage', 'openedSummary'];
const bucketKeys = ['closed', 'endDate', 'opened', 'startDate'];

// 60 of 80 opened were closed (75%) against 40 of 50 (80%): down 5 points, minus 6.25 percent.
const expectedBody = {
  efficiencyPercentage: {
    current: 75,
    previous: 80,
    percentageChange: -6.25,
    changeValue: -5,
    ...period,
  },
  openedSummary: { current: 80, previous: 50, percentageChange: 60, changeValue: 30, ...period },
  closedSummary: { current: 60, previous: 40, percentageChange: 50, changeValue: 20, ...period },
  data: [
    { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), opened: 30, closed: 20 },
    { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), opened: 25, closed: 20 },
    { startDate: isoDay('2025-03-01'), endDate: isoDay('2025-03-31'), opened: 25, closed: 20 },
  ],
};

const nullEfficiency = {
  current: null,
  previous: null,
  percentageChange: null,
  changeValue: null,
  ...period,
};
const zeroSummary = { current: 0, previous: 0, percentageChange: 0, changeValue: 0, ...period };
const emptyBody = {
  efficiencyPercentage: nullEfficiency,
  openedSummary: zeroSummary,
  closedSummary: zeroSummary,
  data: [],
};

interface PipeRows {
  bucket?: object[];
  current?: object[];
  previous?: object[];
  series?: object[];
}

const routeTinybird = ({
  bucket,
  current = [currentRow],
  previous = [previousRow],
  series = seriesRows,
}: PipeRows = {}) =>
  tinybirdStub((url) => {
    if (url.searchParams.has('granularity')) {
      return series;
    }
    return url.searchParams.get('startDate') === atMidnight(previousStart) ? previous : current;
  }, bucket);

const url = (params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') =>
  `/v1-alpha/projects/${slug}/development/review-efficiency?${queryString({
    startDate,
    endDate,
    granularity: 'monthly',
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/development/review-efficiency (AC1)', () => {
  it('returns the efficiency percentage, both count summaries and one bucket per granularity step', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, mergedCount: 55, extra: 'x' }],
        series: seriesRows.map((row) => ({ ...row, mergedCount: 19, platform: 'github' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<Record<string, object> & { data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(bodyKeys);
    for (const key of ['efficiencyPercentage', 'openedSummary', 'closedSummary']) {
      expect(Object.keys(body[key] ?? {}).sort()).toEqual([...summaryKeys].sort());
    }
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(bucketKeys);
    }
    expect(res.body).not.toContain('mergedCount');
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three review_efficiency calls with the slug as project', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.pathname).toBe('/v0/pipes/review_efficiency.json');
      expect(call.searchParams.get('project')).toBe('kubernetes');
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

  // The enum is case-sensitive, as the project route's connectedPlatforms values are lowercase.
  it.each(['bitbucket', 'GitHub'])(
    'rejects platform=%s before calling Tinybird',
    async (platform) => {
      const res = await get(url({ platform }));
      expect(res.statusCode).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );
});

describe('efficiency percentage (AC4)', () => {
  it('is closed as a percentage of opened in each period, with the change in percentage points', async () => {
    const res = await get(url());
    expect(res.json().efficiencyPercentage).toEqual({
      current: 75,
      previous: 80,
      percentageChange: -6.25,
      changeValue: -5,
      ...period,
    });
  });

  it('passes the ratio through unclamped when a row reports more closed than opened', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ openedCount: 40, resolvedCount: 50 }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().efficiencyPercentage).toEqual({
      current: 125,
      previous: 80,
      percentageChange: 56.25,
      changeValue: 45,
      ...period,
    });
  });

  it('signs every summary by its direction', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ openedCount: 30, resolvedCount: 30 }] }),
    );
    const res = await get(url());
    expect(res.json()).toMatchObject({
      efficiencyPercentage: { current: 100, previous: 80, percentageChange: 25, changeValue: 20 },
      openedSummary: { current: 30, previous: 50, percentageChange: -40, changeValue: -20 },
      closedSummary: { current: 30, previous: 40, percentageChange: -25, changeValue: -10 },
    });
  });

  it('is null for the current period when nothing was opened, keeping the previous value and nulling the change', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ openedCount: 0, resolvedCount: 5 }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      efficiencyPercentage: { ...nullEfficiency, previous: 80 },
      openedSummary: { current: 0, previous: 50, percentageChange: -100, changeValue: -50 },
      closedSummary: { current: 5, previous: 40, percentageChange: -87.5, changeValue: -35 },
    });
  });

  it('is null for the previous period when nothing was opened there, keeping the current value', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ openedCount: 0, resolvedCount: 0 }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      efficiencyPercentage: { ...nullEfficiency, current: 75 },
      openedSummary: { current: 80, previous: 0, percentageChange: null, changeValue: 80 },
      closedSummary: { current: 60, previous: 0, percentageChange: null, changeValue: 60 },
    });
  });

  it('is null in both periods when neither opened a pull request', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ openedCount: 0, resolvedCount: 0 }],
        previous: [{ openedCount: 0, resolvedCount: 0 }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      efficiencyPercentage: nullEfficiency,
      openedSummary: zeroSummary,
      closedSummary: zeroSummary,
    });
  });

  it('nulls percentageChange when the previous efficiency is 0 and the current one is not', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ openedCount: 50, resolvedCount: 0 }] }),
    );
    const res = await get(url());
    expect(res.json().efficiencyPercentage).toEqual({
      current: 75,
      previous: 0,
      percentageChange: null,
      changeValue: 75,
      ...period,
    });
  });

  it('reports 0 efficiency with a 0 change when pull requests were opened but none closed in either period', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ openedCount: 80, resolvedCount: 0 }],
        previous: [{ openedCount: 50, resolvedCount: 0 }],
      }),
    );
    const res = await get(url());
    expect(res.json().efficiencyPercentage).toEqual(zeroSummary);
  });
});

describe('empty results (AC5)', () => {
  it('returns zero counts, a null efficiency and an empty series when the pipe has no rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [], previous: [], series: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
  });

  it('returns the same null efficiency and zeros for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
    vi.restoreAllMocks();
  });

  it('treats a summary row without counts as a period without pull requests', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [{}] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      efficiencyPercentage: { ...nullEfficiency, previous: 80 },
      openedSummary: { current: 0, previous: 50 },
      closedSummary: { current: 0, previous: 40 },
    });
  });

  it('drops a series row with a null bucket bound instead of formatting it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: null, endDate: null, openedCount: 5, resolvedCount: 1 },
          { startDate: '2025-01-01', endDate: '2025-01-31', openedCount: 30, resolvedCount: 20 },
          { startDate: '2025-02-01', endDate: null, openedCount: 9, resolvedCount: 2 },
          { startDate: null, endDate: '2025-03-31', openedCount: 4, resolvedCount: 3 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), opened: 30, closed: 20 },
    ]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });

  it('reports 0 opened and 0 closed for a bucket row without counts', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), opened: 0, closed: 0 },
    ]);
  });
});

describe('request validation (AC7)', () => {
  it('accepts an unknown query key and leaves it out of the pipe calls', async () => {
    const res = await get(url({ metric: 'review-efficiency' }));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.has('metric')).toBe(false);
    }
  });

  it('defaults the range to 2010-01-01 through today when both dates are omitted', async () => {
    await atDate('2025-09-21T12:00:00Z', async () => {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      expect(res.json().efficiencyPercentage).toMatchObject({
        periodFrom: isoDay('2010-01-01'),
        periodTo: isoDay('2025-09-21'),
      });
      const series = pipeCalls().find((call) => call.searchParams.has('granularity'));
      expect(series?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
      expect(series?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    });
  });
});

describe('Tinybird failures (AC8)', () => {
  it.each([
    ['series', { series: [null] }],
    ['current summary', { current: [null] }],
    ['previous summary', { previous: [null] }],
  ])('maps a null %s row to 503 upstream_unavailable', async (_kind, rows) => {
    mockFetch.mockImplementation(routeTinybird(rows as unknown as PipeRows));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('startDate');
  });

  it.each([
    ['an array in place of a row', { current: [[]] }],
    ['a string count', { current: [{ openedCount: '80', resolvedCount: 60 }] }],
    ['a negative count', { previous: [{ openedCount: 50, resolvedCount: -1 }] }],
    [
      'a fractional count',
      { series: [{ startDate: '2025-01-01', endDate: '2025-01-31', openedCount: 1.5 }] },
    ],
  ])('maps %s to 503 upstream_unavailable', async (_kind, rows) => {
    mockFetch.mockImplementation(routeTinybird(rows as unknown as PipeRows));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
  });
});

describe('OpenAPI (AC10)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[developmentPath('review-efficiency')]?.get;
  }
  const unitOf = (schema?: OpenApiSchema) => schema?.description?.match(/\(([a-z ]+)\)\./)?.[1];

  it('documents integer counts in the buckets', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const bucket = schema?.properties?.data?.items;
    expect(bucket?.properties?.opened?.type).toBe('integer');
    expect(bucket?.properties?.closed?.type).toBe('integer');
  });

  it('documents the efficiency as nullable percent values with the change in percentage points', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const efficiency = schema?.properties?.efficiencyPercentage;
    for (const field of ['current', 'previous', 'changeValue', 'percentageChange']) {
      expect(efficiency?.properties?.[field], `efficiencyPercentage.${field}`).toMatchObject({
        type: 'number',
        nullable: true,
      });
    }
    expect(unitOf(efficiency?.properties?.current)).toBe('percent');
    expect(unitOf(efficiency?.properties?.previous)).toBe('percent');
    expect(unitOf(efficiency?.properties?.changeValue)).toBe('percentage points');
    expect(efficiency?.properties?.current?.description).toMatch(/null/i);
  });

  it.each(['openedSummary', 'closedSummary'])('documents %s as integer counts', async (field) => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const summary = schema?.properties?.[field];
    for (const key of ['current', 'previous', 'changeValue']) {
      expect(summary?.properties?.[key]?.type, `${field}.${key}`).toBe('integer');
      expect(unitOf(summary?.properties?.[key]), `${field}.${key}`).toBe('count');
    }
    expect(summary?.properties?.percentageChange).toMatchObject({
      type: 'number',
      nullable: true,
    });
  });

  it('documents the query params, with platform an optional enum', async () => {
    const operation = await getOperation();
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual([
      'endDate',
      'granularity',
      'platform',
      'repos',
      'startDate',
    ]);
    const platform = params.get('platform');
    expect(platform?.required).toBeFalsy();
    expect(platform?.schema.enum).toEqual(platforms);
    expect(parameterDescription(platform)).toMatch(/connectedPlatforms/);
  });

  it('states the ratio-to-percent reshape, the null rule and what an omitted platform covers', async () => {
    const operation = await getOperation();
    expect(operation?.description).toMatch(/percent/);
    expect(operation?.description).toMatch(/null/i);
    expect(operation?.description).toMatch(/platform/);
    expect(operation?.description).toMatch(/00:00 UTC/);
  });
});
