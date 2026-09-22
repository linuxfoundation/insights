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
} from './helpers/tinybird.js';

const startDate = '2025-01-01';
const endDate = '2025-03-31';
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
  `/v1-alpha/projects/${slug}/development/active-days?${queryString({
    startDate,
    endDate,
    granularity: 'monthly',
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

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
      expect(call.pathname).toBe('/v0/pipes/active_days.json');
      expect(call.searchParams.get('project')).toBe('kubernetes');
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

  it('is an optional boolean query parameter that defaults to false', async () => {
    const spec = (await get('/v1-alpha/openapi.json')).json<OpenApiDoc>();
    const params = spec.paths[developmentPath('active-days')]?.get?.parameters?.filter(
      (param) => param.in === 'query',
    );
    expect(params?.map((param) => param.name).sort()).toEqual(
      ['endDate', 'granularity', 'includeCollaborations', 'repos', 'startDate'].sort(),
    );
    const includeCollaborations = params?.find((param) => param.name === 'includeCollaborations');
    expect(includeCollaborations?.required).toBeFalsy();
    expect(includeCollaborations?.schema).toMatchObject({ type: 'boolean', default: false });
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

  it('returns the same zeros for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(zeroBody);
    vi.restoreAllMocks();
  });

  it('returns 0 for a null avgContributionsPerDay', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ activeDaysCount: 0, avgContributionsPerDay: null }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().avgContributionsPerDay).toBe(0);
  });

  it('drops a series row with a null bucket bound instead of formatting it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: null, endDate: null, activityCount: 5 },
          { startDate: '2025-01-01', endDate: '2025-01-31', activityCount: 698 },
          { startDate: '2025-02-01', endDate: null, activityCount: 9 },
          { startDate: null, endDate: '2025-03-31', activityCount: 4 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), contributions: 698 },
    ]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });

  it('reports 0 contributions for a bucket row without an activityCount', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), contributions: 0 },
    ]);
  });
});
