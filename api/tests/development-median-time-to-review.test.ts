// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  atDate,
  developmentPath,
  mockFetch,
  pipeCalls,
  queryString,
  tinybirdHost,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
  type OpenApiOperation,
} from './helpers/tinybird.js';

const startDate = '2025-01-01';
const endDate = '2025-03-31';
const previousStart = '2024-10-01';
const previousEnd = '2024-12-31';
const atMidnight = (day: string) => `${day} 00:00:00`;
const isoDay = (day: string) => `${day}T00:00:00Z`;

const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';
const platforms = ['github', 'gitlab', 'gerrit'];

// The summary calls answer one row of a Nullable median; the series answers one row per bucket
// with 0 where no pull request opened in the bucket was reviewed.
const currentRow = { medianTimeToReviewSeconds: 86400 };
const previousRow = { medianTimeToReviewSeconds: 115200 };
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', medianTimeToReviewSeconds: 72000 },
  { startDate: '2025-02-01', endDate: '2025-02-28', medianTimeToReviewSeconds: 0 },
  { startDate: '2025-03-01', endDate: '2025-03-31', medianTimeToReviewSeconds: 100800 },
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
const bucketKeys = ['startDate', 'endDate', 'medianTimeToReviewSeconds'];

const expectedData = [
  {
    startDate: isoDay('2025-01-01'),
    endDate: isoDay('2025-01-31'),
    medianTimeToReviewSeconds: 72000,
  },
  { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), medianTimeToReviewSeconds: 0 },
  {
    startDate: isoDay('2025-03-01'),
    endDate: isoDay('2025-03-31'),
    medianTimeToReviewSeconds: 100800,
  },
];
const expectedBody = {
  summary: {
    current: 86400,
    previous: 115200,
    percentageChange: -25,
    changeValue: -28800,
    ...period,
  },
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
  `/v1-alpha/projects/${slug}/development/median-time-to-review?${queryString({
    startDate,
    endDate,
    granularity: 'monthly',
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/development/median-time-to-review (AC1)', () => {
  it('returns the median summary from the two summary rows and one bucket per series row', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, unit: 'seconds', extra: 'x' }],
        previous: [{ ...previousRow, extra: 'x' }],
        series: seriesRows.map((row, index) => ({ ...row, day: index + 1, extra: 'x' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ summary: object; data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'summary']);
    expect(Object.keys(body.summary).sort()).toEqual([...summaryKeys].sort());
    expect(body.data).toHaveLength(3);
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual([...bucketKeys].sort());
    }
    expect(res.body).not.toContain('extra');
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three median_time_to_review calls with the slug as project', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.pathname).toBe('/v0/pipes/median_time_to_review.json');
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

  it.each(['bitbucket', ''])('rejects platform=%s before calling Tinybird', async (platform) => {
    const res = await get(url({ platform }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('periods without a reviewed pull request (AC4)', () => {
  it('keeps the previous value and nulls the change when the current median is null', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [{ medianTimeToReviewSeconds: null }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, previous: 115200 });
  });

  it('keeps the current value and nulls the change when the previous median is null', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ medianTimeToReviewSeconds: null }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, current: 86400 });
  });

  it('nulls the summary entirely when neither period has a reviewed pull request', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ medianTimeToReviewSeconds: null }],
        previous: [{ medianTimeToReviewSeconds: null }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ summary: nullSummary, data: expectedData });
  });

  it('treats an empty current result as a period without data', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, previous: 115200 });
  });

  it('treats an empty previous result as a comparison period without data', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, current: 86400 });
  });

  it('returns a null summary and an empty series when no call has rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [], previous: [], series: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
  });

  it('returns the same null summary and empty series for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
    vi.restoreAllMocks();
  });
});

describe('percentageChange (AC5)', () => {
  it('is negative when the current median is shorter than the previous one', async () => {
    const res = await get(url());
    expect(res.json().summary).toMatchObject({ percentageChange: -25, changeValue: -28800 });
  });

  it('is positive when the current median is longer than the previous one', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ medianTimeToReviewSeconds: 129600 }],
        previous: [{ medianTimeToReviewSeconds: 86400 }],
      }),
    );
    const res = await get(url());
    expect(res.json().summary).toMatchObject({
      current: 129600,
      previous: 86400,
      percentageChange: 50,
      changeValue: 43200,
    });
  });

  it('is null when the previous median is 0 and the current one is not', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ medianTimeToReviewSeconds: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({
      current: 86400,
      previous: 0,
      percentageChange: null,
      changeValue: 86400,
      ...period,
    });
  });

  it('is 0 when both medians are 0', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ medianTimeToReviewSeconds: 0 }],
        previous: [{ medianTimeToReviewSeconds: 0 }],
      }),
    );
    const res = await get(url());
    expect(res.json().summary).toEqual({
      current: 0,
      previous: 0,
      percentageChange: 0,
      changeValue: 0,
      ...period,
    });
  });
});

describe('series buckets (AC6)', () => {
  it('passes the 0 the pipe reports for a bucket without a reviewed pull request through', async () => {
    const res = await get(url());
    expect(res.json().data[1]).toEqual(expectedData[1]);
    expect(res.json().data[1].medianTimeToReviewSeconds).toBe(0);
  });

  it('reports 0 for a bucket row without the median field', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      {
        startDate: isoDay('2025-01-01'),
        endDate: isoDay('2025-01-31'),
        medianTimeToReviewSeconds: 0,
      },
    ]);
  });

  it('drops a series row with a null bucket bound instead of formatting it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: null, endDate: null, medianTimeToReviewSeconds: 5 },
          { startDate: '2025-01-01', endDate: '2025-01-31', medianTimeToReviewSeconds: 72000 },
          { startDate: '2025-02-01', endDate: null, medianTimeToReviewSeconds: 9 },
          { startDate: null, endDate: '2025-03-31', medianTimeToReviewSeconds: 4 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([expectedData[0]]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });

  it('keeps the series rows in pipe order', async () => {
    mockFetch.mockImplementation(routeTinybird({ series: [...seriesRows].reverse() }));
    const res = await get(url());
    expect(res.json().data).toEqual([...expectedData].reverse());
  });

  it('returns an empty series when the pipe has no bucket rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ series: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ summary: expectedBody.summary, data: [] });
  });
});

describe('request validation (AC8)', () => {
  it('defaults the range to 2010-01-01 through today when both dates are omitted', async () => {
    await atDate('2025-09-21T12:00:00Z', async () => {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      expect(res.json().summary).toMatchObject({
        periodFrom: isoDay('2010-01-01'),
        periodTo: isoDay('2025-09-21'),
      });
      const series = pipeCalls().find((call) => call.searchParams.has('granularity'));
      expect(series?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
      expect(series?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    });
  });

  it('accepts and ignores unknown query keys', async () => {
    const res = await get(url({ foo: 'bar' }));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    for (const call of pipeCalls()) {
      expect(call.searchParams.has('foo')).toBe(false);
    }
  });
});

describe('Tinybird failures (AC9)', () => {
  it.each<[string, PipeRows]>([
    [
      'a string median in the current summary',
      { current: [{ medianTimeToReviewSeconds: 'fast' }] },
    ],
    [
      'a string median in the previous summary',
      { previous: [{ medianTimeToReviewSeconds: 'fast' }] },
    ],
    ['a null current summary row', { current: [null as unknown as object] }],
    ['a scalar current summary row', { current: ['fast' as unknown as object] }],
    ['an array current summary row', { current: [[] as unknown as object] }],
    [
      'a string median in a bucket',
      {
        series: [
          { startDate: '2025-01-01', endDate: '2025-01-31', medianTimeToReviewSeconds: 'fast' },
        ],
      },
    ],
    [
      'a numeric bucket bound',
      {
        series: [{ startDate: 20250101, endDate: '2025-01-31', medianTimeToReviewSeconds: 72000 }],
      },
    ],
    [
      'a bucket row without a start bound',
      { series: [{ endDate: '2025-01-31', medianTimeToReviewSeconds: 72000 }] },
    ],
  ])('maps %s to 503 upstream_unavailable', async (_case, rows) => {
    mockFetch.mockImplementation(routeTinybird(rows));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('fast');
  });
});

describe('OpenAPI (AC11)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[developmentPath('median-time-to-review')]?.get;
  }

  it('has a description that covers platform', async () => {
    const operation = await getOperation();
    expect(operation?.description).toMatch(/`platform`/);
    for (const platform of ['GitHub', 'GitLab', 'Gerrit']) {
      expect(operation?.description).toContain(platform);
    }
  });

  it('types the summary values nullable and the bucket median a number that is not', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const summary = schema?.properties?.summary;
    for (const field of ['current', 'previous', 'changeValue', 'percentageChange']) {
      expect(summary?.properties?.[field], `summary.${field}`).toMatchObject({
        type: 'number',
        nullable: true,
      });
    }
    const bucket = schema?.properties?.data?.items;
    expect(bucket?.properties?.medianTimeToReviewSeconds?.type).toBe('number');
    expect(bucket?.properties?.medianTimeToReviewSeconds?.nullable).toBeUndefined();
  });

  it('documents the query params, with platform an optional enum', async () => {
    const operation = await getOperation();
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual(
      ['endDate', 'granularity', 'platform', 'repos', 'startDate'].sort(),
    );
    const platform = params.get('platform');
    expect(platform?.required).toBeFalsy();
    expect(platform?.schema).toMatchObject({ type: 'string', enum: platforms });
  });
});
