// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

const route = '/v1-alpha/projects/kubernetes/development/contributions-outside-work-hours';
const currentRange = '?startDate=2025-01-01&endDate=2025-03-31';
const currentStart = '2025-01-01 00:00:00';

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

const zeroBody = {
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
};

interface PipeFixture {
  current: object[];
  previous: object[];
  start?: string;
  bucket?: object[];
}

// The two heatmap calls run concurrently, so the stub routes by startDate instead of by call
// order.
function stubTinybird({ current, previous, start = currentStart, bucket }: PipeFixture) {
  mockFetch.mockImplementation(
    tinybirdStub(
      (url) => (url.searchParams.get('startDate') === start ? current : previous),
      bucket,
    ),
  );
}

const { get } = useApp();
const getBody = async (url: string) => (await get(url)).json<Body>();

beforeEach(() => {
  stubTinybird({ current: currentRows, previous: previousRows });
});

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
    const res = await get(`${route}${currentRange}`);
    expect(res.statusCode).toBe(200);

    const calls = pipeCalls();
    expect(calls).toHaveLength(2);
    for (const url of calls) {
      expect(url.origin).toBe(tinybirdHost);
      expect(url.pathname).toBe('/v0/pipes/activity_heatmap_by_weekday_and_2hours_blocks.json');
      expect(url.searchParams.get('project')).toBe('kubernetes');
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
    expect(res.json()).toEqual(zeroBody);
  });

  it('returns the same zeros for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    stubTinybird({ current: currentRows, previous: previousRows, bucket: [] });
    const res = await get(
      `/v1-alpha/projects/no-such-project/development/contributions-outside-work-hours${currentRange}`,
    );
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(zeroBody);
    vi.restoreAllMocks();
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

describe('OpenAPI (AC11)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[developmentPath('contributions-outside-work-hours')]?.get;
  }

  it('gives the work-hours definition and timezone in the description', async () => {
    const operation = await getOperation();
    expect(operation?.description).toMatch(/18:00/);
    expect(operation?.description).toMatch(/08:00/);
    expect(operation?.description).toMatch(/local time/i);
  });

  it('lists the query params, with both booleans optional and defaulted', async () => {
    const parameters = (await getOperation())?.parameters ?? [];
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
});
