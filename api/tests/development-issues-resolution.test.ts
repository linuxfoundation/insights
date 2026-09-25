// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolvePeriods } from '../src/lib/period.js';
import {
  calledUrls,
  callsTo,
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

const route = '/v1-alpha/projects/kubernetes/development/issues-resolution';
const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';

const activitiesPath = '/v0/pipes/activities_count.json';
const velocityPath = '/v0/pipes/issues_average_resolve_velocity.json';

// The request range and the previous range resolvePeriods derives from it (the UI's 90d preset).
const range = { startDate: '2025-06-20', endDate: '2025-09-18' };
const previousRange = { startDate: '2025-03-21', endDate: '2025-06-19' };
const tinybirdDay = (day: string) => `${day} 00:00:00`;
const isoDay = (day: string) => `${day}T00:00:00Z`;

// One row set per pipe call, shaped like frontend/server/mocks/tinybird-issues-response.mock.ts.
interface PipeRows {
  bucket?: object[];
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

function pipeRows(url: URL, rows: PipeRows): object[] {
  const params = url.searchParams;
  switch (url.pathname) {
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

function serveTinybird(rows: PipeRows = defaultRows) {
  mockFetch.mockImplementation(tinybirdStub((url) => pipeRows(url, rows), rows.bucket));
}

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
  return `${path}?${queryString(params)}`;
}

const defaultQuery = { granularity: 'monthly', ...range, repos: [k8sRepo, websiteRepo] };

const { get } = useApp();

beforeEach(() => {
  serveTinybird();
});

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
  it('makes four activities_count calls and one velocity call', async () => {
    await get(withQuery(defaultQuery));
    expect(pipeCalls()).toHaveLength(5);
    expect(callsTo(activitiesPath)).toHaveLength(4);
    expect(callsTo(velocityPath)).toHaveLength(1);
    for (const url of pipeCalls()) {
      expect(url.origin).toBe(tinybirdHost);
    }
  });

  it('sends the common filter on every pipe call', async () => {
    await get(withQuery(defaultQuery));
    expect(pipeCalls()).toHaveLength(5);
    for (const url of pipeCalls()) {
      const params = url.searchParams;
      expect(params.get('project')).toBe('kubernetes');
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
});

describe('omitted dates (AC3)', () => {
  it('sends no dates on the current-period calls, the computed range on the previous summary, and reports the default period', async () => {
    const { current, previous } = resolvePeriods();
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
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with zero data', async () => {
    serveTinybird({ ...defaultRows, bucket: [] });
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
  });
});

describe('validation (AC6)', () => {
  it('ignores unknown query keys', async () => {
    const res = await get(withQuery({ ...defaultQuery, platform: 'github' }));
    expect(res.statusCode).toBe(200);
  });
});

describe('/v1-alpha spec (AC9)', () => {
  const routePath = developmentPath('issues-resolution');

  async function getOperation(): Promise<OpenApiOperation> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    const operation = res.json<OpenApiDoc>().paths[routePath]?.get;
    expect(operation, `${routePath} is not in the alpha spec`).toBeDefined();
    return operation!;
  }

  it('formats the response dates as date-time and makes avgResolveTimeSeconds nullable', async () => {
    const operation = await getOperation();
    const schema = operation.responses['200']?.content['application/json']?.schema;

    const summary = schema?.properties?.summary;
    expect(summary?.properties?.avgResolveTimeSeconds?.nullable).toBe(true);
    expect(summary?.properties?.periodFrom?.format).toBe('date-time');

    const bucket = schema?.properties?.data?.items;
    expect(bucket?.properties?.startDate?.format).toBe('date-time');
    expect(bucket?.properties?.endDate?.format).toBe('date-time');
  });
});
