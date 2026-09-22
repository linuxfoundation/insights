// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  developmentPath,
  mockFetch,
  pipeCalls,
  tinybirdHost,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
  type OpenApiOperation,
} from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/development/pull-requests';
const rangeQuery = 'startDate=2025-01-01&endDate=2025-03-31&granularity=weekly';

const activitiesPath = '/v0/pipes/activities_count.json';
const velocityPath = '/v0/pipes/pull_requests_average_resolve_velocity.json';

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

function defaultRows(url: URL): object[] {
  const params = url.searchParams;
  switch (url.pathname) {
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

const tinybird = (rowsFor: (url: URL) => object[] = defaultRows, bucket?: object[]) =>
  tinybirdStub(rowsFor, bucket);

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

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(tinybird());
});

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
  it('makes the ten pipe calls with the common filter, activity groups and ranges', async () => {
    await get(`${route}?${rangeQuery}`);

    for (const url of pipeCalls()) {
      expect(url.origin).toBe(tinybirdHost);
      expect(url.searchParams.get('project')).toBe('kubernetes');
      expect(url.searchParams.get('onlyContributions')).toBe('false');
      expect(url.searchParams.get('includeCodeContributions')).toBe('true');
      expect(url.searchParams.get('includeCollaborations')).toBe('true');
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

  it('returns zero summaries and an empty series for a slug with no bucket', async () => {
    mockFetch.mockImplementation(tinybird(defaultRows, []));
    const res = await get(
      '/v1-alpha/projects/no-such-project/development/pull-requests?' + rangeQuery,
    );
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
  });

  it('returns the same zero shape when every pipe has no rows', async () => {
    mockFetch.mockImplementation(tinybird(() => []));
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

describe('OpenAPI spec (AC11)', () => {
  const routePath = developmentPath('pull-requests');

  async function getOperation(): Promise<OpenApiOperation> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    const operation = res.json<OpenApiDoc>().paths[routePath]?.get;
    expect(operation, `${routePath} is missing from the spec`).toBeDefined();
    return operation as OpenApiOperation;
  }

  it('states the Tinybird call count in the description', async () => {
    const operation = await getOperation();
    expect(operation.description).toMatch(/11 Tinybird calls/);
  });

  it('formats the response dates as date-time and makes the resolve time and percentageChange nullable', async () => {
    const operation = await getOperation();
    const schema = operation.responses['200']?.content['application/json']?.schema;
    expect(schema?.properties?.avgResolveTimeSeconds).toMatchObject({
      type: 'number',
      nullable: true,
    });

    for (const key of ['openedSummary', 'mergedSummary', 'closedSummary']) {
      const summary = schema?.properties?.[key];
      expect(summary?.properties?.percentageChange?.nullable).toBe(true);
      expect(summary?.properties?.periodFrom?.format).toBe('date-time');
    }

    const bucket = schema?.properties?.data?.items;
    expect(bucket?.properties?.startDate?.format).toBe('date-time');
    expect(bucket?.properties?.endDate?.format).toBe('date-time');
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
