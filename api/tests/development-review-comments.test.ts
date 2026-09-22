// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
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

// The Nuxt reviewCommentsActivityTypes list, in its order; the client joins arrays with commas.
const reviewCommentTypes = [
  'pull_request-comment',
  'pull_request-review-thread-comment',
  'merge_request-comment',
  'changeset_comment-created',
  'patchset_comment-created',
];

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

const currentRow = { activityCount: 120 };
const previousRow = { activityCount: 100 };
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', activityCount: 45 },
  { startDate: '2025-02-01', endDate: '2025-02-28', activityCount: 38 },
  { startDate: '2025-03-01', endDate: '2025-03-31', activityCount: 37 },
];

const expectedBody = {
  summary: {
    current: 120,
    previous: 100,
    percentageChange: 20,
    changeValue: 20,
    periodFrom: isoDay(startDate),
    periodTo: isoDay(endDate),
  },
  data: [
    { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), reviewComments: 45 },
    { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), reviewComments: 38 },
    { startDate: isoDay('2025-03-01'), endDate: isoDay('2025-03-31'), reviewComments: 37 },
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

// The series call is the one that carries granularity; the two summary calls differ by their
// startDate.
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
  `/v1-alpha/projects/${slug}/development/review-comments?${queryString({
    startDate,
    endDate,
    granularity: 'monthly',
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/development/review-comments (AC1)', () => {
  it('returns the review comment summary and one bucket per granularity step', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, extra: 'x' }],
        series: seriesRows.map((row, index) => ({ ...row, day: index + 1, extra: 'x' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'summary']);
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(['endDate', 'reviewComments', 'startDate']);
    }
  });

  // activities_count answers Date bounds for most granularities and DateTime bounds for others.
  it('formats DateTime bucket bounds the same way as Date bounds', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: '2025-01-01 00:00:00', endDate: '2025-01-31 23:59:59', activityCount: 45 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: '2025-01-01T00:00:00Z', endDate: '2025-01-31T23:59:59Z', reviewComments: 45 },
    ]);
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three activities_count calls with the slug and the review comment activity types', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.pathname).toBe('/v0/pipes/activities_count.json');
      expect(call.searchParams.get('project')).toBe('kubernetes');
      expect(call.searchParams.get('activity_types')).toBe(reviewCommentTypes.join(','));
    }
  });

  // The Nuxt handler sends none of the contribution flags for this metric, so the pipe defaults
  // decide; a flag added here would change the numbers against the widget.
  it('sends exactly the parameters the Insights widget sends for this metric', async () => {
    await get(url({ repos: k8sRepo }));
    const summaryKeys = ['activity_types', 'bucketId', 'endDate', 'project', 'repos', 'startDate'];
    const seriesKeys = [...summaryKeys, 'granularity'].sort();
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      const keys = [...call.searchParams.keys()].sort();
      expect(keys).toEqual(call.searchParams.has('granularity') ? seriesKeys : summaryKeys);
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
      const series = pipeCalls().find((call) => call.searchParams.has('granularity'));
      expect(series?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
      expect(series?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('percentageChange (AC3)', () => {
  it('is negative when the current period has fewer review comments', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ activityCount: 50 }], previous: [{ activityCount: 200 }] }),
    );
    const res = await get(url());
    expect(res.json().summary).toMatchObject({
      current: 50,
      previous: 200,
      percentageChange: -75,
      changeValue: -150,
    });
  });

  it('is null when the previous period had no review comments and the current one has some', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ activityCount: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({ current: 120, previous: 0, percentageChange: null });
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

  it('reports 0 review comments for a bucket row without an activityCount', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), reviewComments: 0 },
    ]);
  });

  // A bucket row without both bounds has no place on the time axis; like the other routes on
  // this pipe, the handler treats it as an answer outside the pipe's contract.
  it('maps a series row without both bucket bounds to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: '2025-01-01', endDate: '2025-01-31', activityCount: 45 },
          { startDate: null, endDate: '2025-02-28', activityCount: 38 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('nullT00:00:00Z');
  });
});

describe('OpenAPI (AC9)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[developmentPath('review-comments')]?.get;
  }

  it('types the review comment counts as integers', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    expect(schema?.properties?.data?.items?.properties?.reviewComments?.type).toBe('integer');
    expect(schema?.properties?.summary?.properties?.current?.type).toBe('integer');
  });

  it('takes the repos, date and granularity query params and no others', async () => {
    const operation = await getOperation();
    const params = operation?.parameters?.filter((param) => param.in === 'query');
    expect(params?.map((param) => param.name).sort()).toEqual([
      'endDate',
      'granularity',
      'repos',
      'startDate',
    ]);
  });

  it('names the counted activity types, the overlap with code-reviews and the required granularity', async () => {
    const operation = await getOperation();
    const description = operation?.description ?? '';
    for (const type of reviewCommentTypes) {
      expect(description).toContain(type);
    }
    expect(description).toContain('code-reviews');
    expect(description).toContain('granularity');
  });
});
