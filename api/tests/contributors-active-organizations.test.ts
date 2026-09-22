// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  atDate,
  contributorsPath,
  mockFetch,
  pipeCalls,
  queryString,
  resolveSchema,
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

const currentRow = { organizationCount: 120 };
const previousRow = { organizationCount: 96 };
// The buckets add up to more than the period count: an organization active in several months
// counts once for the period.
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', organizationCount: 80 },
  { startDate: '2025-02-01', endDate: '2025-02-28', organizationCount: 75 },
  { startDate: '2025-03-01', endDate: '2025-03-31', organizationCount: 90 },
];

const expectedBody = {
  summary: {
    current: 120,
    previous: 96,
    percentageChange: 25,
    changeValue: 24,
    periodFrom: isoDay(startDate),
    periodTo: isoDay(endDate),
  },
  data: [
    { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), organizations: 80 },
    { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), organizations: 75 },
    { startDate: isoDay('2025-03-01'), endDate: isoDay('2025-03-31'), organizations: 90 },
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
  `/v1-alpha/projects/${slug}/contributors/active-organizations?${queryString({
    startDate,
    endDate,
    granularity: 'monthly',
    ...params,
  })}`;

const { get } = useApp();

const openApi = async () => {
  const spec = (await get('/v1-alpha/openapi.json')).json<OpenApiDoc>();
  const operation = spec.paths[contributorsPath('active-organizations')]?.get;
  const body = resolveSchema(
    spec,
    operation?.responses['200']?.content['application/json']?.schema,
  );
  return { spec, operation, body };
};

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/contributors/active-organizations (AC1)', () => {
  it('returns the period counts from the summary calls and one bucket per granularity step', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, extra: 'x' }],
        series: seriesRows.map((row) => ({ ...row, extra: 'x' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ summary: object; data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'summary']);
    expect(Object.keys(body.summary).sort()).toEqual(
      ['changeValue', 'current', 'percentageChange', 'periodFrom', 'periodTo', 'previous'].sort(),
    );
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(['endDate', 'organizations', 'startDate']);
    }
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three active_organizations calls with the slug as project and both flags at their defaults', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.pathname).toBe('/v0/pipes/active_organizations.json');
      expect(call.searchParams.get('project')).toBe('kubernetes');
      expect(call.searchParams.get('includeCodeContributions')).toBe('true');
      expect(call.searchParams.get('includeCollaborations')).toBe('false');
    }
  });

  it.each(['weekly', 'quarterly'])(
    'sends the current range twice, once with granularity=%s, and the previous range once',
    async (granularity) => {
      await get(url({ granularity }));
      const ranges = pipeCalls().map((call) => [
        call.searchParams.get('startDate'),
        call.searchParams.get('endDate'),
        call.searchParams.get('granularity'),
      ]);
      expect(ranges).toHaveLength(3);
      expect(ranges).toEqual(
        expect.arrayContaining([
          [atMidnight(startDate), atMidnight(endDate), null],
          [atMidnight(startDate), atMidnight(endDate), granularity],
          [atMidnight(previousStart), atMidnight(previousEnd), null],
        ]),
      );
    },
  );

  it('sends the resolved range, 2010-01-01 through today, when both dates are omitted', async () => {
    await atDate('2025-09-21T12:00:00Z', async () => {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      expect(res.json().summary).toMatchObject({
        periodFrom: isoDay('2010-01-01'),
        periodTo: isoDay('2025-09-21'),
      });
      const currentCalls = pipeCalls().filter(
        (call) => call.searchParams.get('startDate') === atMidnight('2010-01-01'),
      );
      expect(currentCalls).toHaveLength(2);
      for (const call of currentCalls) {
        expect(call.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
      }
    });
  });
});

describe('contribution flags (AC3)', () => {
  it('passes includeCollaborations=true and includeCodeContributions=false to all three pipe calls', async () => {
    const res = await get(
      url({ includeCollaborations: 'true', includeCodeContributions: 'false' }),
    );
    expect(res.statusCode).toBe(200);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('includeCollaborations')).toBe('true');
      expect(call.searchParams.get('includeCodeContributions')).toBe('false');
    }
  });

  it.each(['includeCollaborations', 'includeCodeContributions'])(
    'rejects %s when it is not a boolean',
    async (flag) => {
      const res = await get(url({ [flag]: 'maybe' }));
      expect(res.statusCode).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );

  it('publishes the series parameters and both flags, the flags as optional booleans with their defaults', async () => {
    const params = (await openApi()).operation?.parameters?.filter((param) => param.in === 'query');
    expect(params?.map((param) => param.name).sort()).toEqual(
      [
        'endDate',
        'granularity',
        'includeCodeContributions',
        'includeCollaborations',
        'repos',
        'startDate',
      ].sort(),
    );
    const byName = new Map(params?.map((param) => [param.name, param]));
    for (const [flag, value] of [
      ['includeCodeContributions', true],
      ['includeCollaborations', false],
    ] as const) {
      expect(byName.get(flag)?.required, flag).toBeFalsy();
      expect(byName.get(flag)?.schema, flag).toMatchObject({ type: 'boolean', default: value });
    }
  });
});

describe('percentageChange (AC4)', () => {
  it('is negative when fewer organizations were active than in the previous period', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ organizationCount: 30 }],
        previous: [{ organizationCount: 40 }],
      }),
    );
    const res = await get(url());
    expect(res.json().summary).toMatchObject({
      current: 30,
      previous: 40,
      percentageChange: -25,
      changeValue: -10,
    });
  });

  it('is null when the previous period had no active organization and the current one has some', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ organizationCount: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({
      current: 120,
      previous: 0,
      percentageChange: null,
      changeValue: 120,
    });
  });

  it('is 0 when neither period had an active organization', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ organizationCount: 0 }],
        previous: [{ organizationCount: 0 }],
      }),
    );
    const res = await get(url());
    expect(res.json().summary).toMatchObject({ current: 0, previous: 0, percentageChange: 0 });
  });
});

describe('empty results (AC5)', () => {
  it('returns a zero summary and an empty series when the pipe has no rows', async () => {
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
          { startDate: null, endDate: null, organizationCount: 5 },
          { startDate: '2025-01-01', endDate: '2025-01-31', organizationCount: 80 },
          { startDate: '2025-02-01', endDate: null, organizationCount: 9 },
          { startDate: null, endDate: '2025-03-31', organizationCount: 4 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), organizations: 80 },
    ]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });

  it('reports 0 organizations for a bucket row without an organizationCount', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), organizations: 0 },
    ]);
  });
});

describe('OpenAPI (AC6)', () => {
  it('defines an active organization by the activity attributed to it and names both flags', async () => {
    const description = (await openApi()).operation?.description;
    expect(description).toMatch(/attributed to/i);
    expect(description).toContain('`includeCodeContributions`');
    expect(description).toContain('`includeCollaborations`');
  });

  it('says the summary counts an organization once while each bucket counts it again', async () => {
    const description = (await openApi()).operation?.description;
    expect(description).toMatch(/\bonce\b/);
    expect(description).toContain('`summary.current`');
  });

  it('says the first and last buckets count only activity inside the period', async () => {
    const { spec, body } = await openApi();
    expect(resolveSchema(spec, body?.properties?.data)?.description).toMatch(/inside the period/);
  });

  it('types the summary counts and the bucket count as integers', async () => {
    const { spec, body } = await openApi();
    const summary = resolveSchema(spec, body?.properties?.summary);
    for (const field of ['current', 'previous', 'changeValue']) {
      expect(summary?.properties?.[field]?.type, field).toBe('integer');
    }
    const bucket = resolveSchema(spec, resolveSchema(spec, body?.properties?.data)?.items);
    expect(bucket?.properties?.organizations?.type).toBe('integer');
  });
});
