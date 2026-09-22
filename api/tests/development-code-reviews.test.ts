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

const codeReviewTypes = [
  'pull_request-reviewed',
  'merge_request-review-changes-requested',
  'merge_request-review-approved',
  'changeset_comment-created',
  'patchset_comment-created',
];

const startDate = '2025-01-01';
const endDate = '2025-03-31';
const previousStart = '2024-10-01';
const previousEnd = '2024-12-31';
const atMidnight = (day: string) => `${day} 00:00:00`;
const isoDay = (day: string) => `${day}T00:00:00Z`;

const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';

const currentRow = { activityCount: 1280 };
const previousRow = { activityCount: 1024 };
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', activityCount: 470 },
  { startDate: '2025-02-01', endDate: '2025-02-28', activityCount: 390 },
  { startDate: '2025-03-01', endDate: '2025-03-31', activityCount: 420 },
];

const expectedBody = {
  summary: {
    current: 1280,
    previous: 1024,
    percentageChange: 25,
    changeValue: 256,
    periodFrom: isoDay(startDate),
    periodTo: isoDay(endDate),
  },
  data: [
    { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), reviews: 470 },
    { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), reviews: 390 },
    { startDate: isoDay('2025-03-01'), endDate: isoDay('2025-03-31'), reviews: 420 },
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
  `/v1-alpha/projects/${slug}/development/code-reviews?${queryString({
    startDate,
    endDate,
    granularity: 'monthly',
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/development/code-reviews (AC1)', () => {
  it('returns the code reviews summary and one bucket per granularity step', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, extra: 'x' }],
        series: seriesRows.map((row) => ({ ...row, activityType: 'pull_request-reviewed' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'summary']);
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(['endDate', 'reviews', 'startDate']);
    }
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three activities_count calls with the slug as project and the five code review types', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.pathname).toBe('/v0/pipes/activities_count.json');
      expect(call.searchParams.get('project')).toBe('kubernetes');
      expect(call.searchParams.get('activity_types')).toBe(codeReviewTypes.join(','));
    }
  });

  // The Nuxt code-reviews branch sends none of these, so the pipe applies its own defaults; sending
  // them here could change the count against the widget.
  it('sends neither the contribution flags nor a singular activity_type', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      for (const key of [
        'activity_type',
        'onlyContributions',
        'includeCodeContributions',
        'includeCollaborations',
      ]) {
        expect(call.searchParams.has(key), `${key} was sent`).toBe(false);
      }
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

describe('percentageChange (AC3)', () => {
  it('is negative when the current period has fewer reviews', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ activityCount: 50 }], previous: [{ activityCount: 100 }] }),
    );
    const res = await get(url());
    expect(res.json().summary).toMatchObject({
      current: 50,
      previous: 100,
      percentageChange: -50,
      changeValue: -50,
    });
  });

  it('is null when the previous period had no reviews and the current one has some', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ activityCount: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({
      current: 1280,
      previous: 0,
      percentageChange: null,
    });
  });
});

describe('empty results (AC4)', () => {
  it('returns zeros and an empty series when the pipe has no rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [], previous: [], series: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(zeroBody);
  });

  it('returns the same zeros for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(zeroBody);
    vi.restoreAllMocks();
  });

  it('drops a series row with a null bucket bound instead of formatting it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: null, endDate: null, activityCount: 5 },
          { startDate: '2025-01-01', endDate: '2025-01-31', activityCount: 470 },
          { startDate: '2025-02-01', endDate: null, activityCount: 9 },
          { startDate: null, endDate: '2025-03-31', activityCount: 4 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), reviews: 470 },
    ]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });

  it('reports 0 reviews for a bucket row without an activityCount', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), reviews: 0 },
    ]);
  });
});

describe('request validation (AC6)', () => {
  // The Nuxt handler took a metric= selector; here the metric is the path, so the key is noise.
  it('accepts an unknown query key and leaves it out of the pipe calls', async () => {
    const res = await get(url({ metric: 'code-reviews' }));
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
      expect(res.json().summary).toMatchObject({
        periodFrom: isoDay('2010-01-01'),
        periodTo: isoDay('2025-09-21'),
      });
      const series = pipeCalls().find((call) => call.searchParams.has('granularity'));
      expect(series?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
      expect(series?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    });
  });
});

describe('OpenAPI (AC9)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[developmentPath('code-reviews')]?.get;
  }

  it('documents the review counts as integers', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    expect(schema?.properties?.data?.items?.properties?.reviews?.type).toBe('integer');
    expect(schema?.properties?.summary?.properties?.current?.type).toBe('integer');
  });

  it('documents only the date range, granularity and repos query params', async () => {
    const operation = await getOperation();
    const params = operation?.parameters?.filter((param) => param.in === 'query');
    expect(params?.map((param) => param.name).sort()).toEqual([
      'endDate',
      'granularity',
      'repos',
      'startDate',
    ]);
  });

  it('names the five code review activity types and the overlap with review-comments', async () => {
    const operation = await getOperation();
    for (const type of codeReviewTypes) {
      expect(operation?.description, `description omits ${type}`).toContain(type);
    }
    expect(operation?.description).toContain('review-comments');
  });
});
