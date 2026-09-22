// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  atDate,
  contributorsPath,
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

const currentRow = { contributorCount: 250, maintainerCount: 12, reviewerCount: 40 };
const previousRow = { contributorCount: 200, maintainerCount: 9, reviewerCount: 31 };
// The series call also reports the whole-range maintainer and reviewer counts on every bucket row.
const seriesRows = [
  {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    contributorCount: 180,
    maintainerCount: 99,
    reviewerCount: 98,
  },
  {
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    contributorCount: 170,
    maintainerCount: 99,
    reviewerCount: 98,
  },
  {
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    contributorCount: 160,
    maintainerCount: 99,
    reviewerCount: 98,
  },
];

const expectedBody = {
  summary: {
    current: 250,
    previous: 200,
    percentageChange: 25,
    changeValue: 50,
    periodFrom: isoDay(startDate),
    periodTo: isoDay(endDate),
  },
  maintainerCount: 12,
  reviewerCount: 40,
  data: [
    { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), contributors: 180 },
    { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), contributors: 170 },
    { startDate: isoDay('2025-03-01'), endDate: isoDay('2025-03-31'), contributors: 160 },
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
  maintainerCount: 0,
  reviewerCount: 0,
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
  `/v1-alpha/projects/${slug}/contributors/active-contributors?${queryString({
    startDate,
    endDate,
    granularity: 'monthly',
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/contributors/active-contributors (AC1)', () => {
  it('returns the contributor summary, the maintainer and reviewer counts and one bucket per granularity step', async () => {
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
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body).sort()).toEqual([
      'data',
      'maintainerCount',
      'reviewerCount',
      'summary',
    ]);
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(['contributors', 'endDate', 'startDate']);
    }
  });
});

describe('maintainerCount and reviewerCount (AC2)', () => {
  it('come from the current-period row, not the previous period or the series rows', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ contributorCount: 5, maintainerCount: 3, reviewerCount: 2 }],
        previous: [{ contributorCount: 4, maintainerCount: 30, reviewerCount: 20 }],
        series: [
          {
            startDate: '2025-01-01',
            endDate: '2025-01-31',
            contributorCount: 5,
            maintainerCount: 300,
            reviewerCount: 200,
          },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ maintainerCount: 3, reviewerCount: 2 });
  });
});

describe('Tinybird calls (AC3)', () => {
  const paramNames = (names: string[]) => [...names].sort().join(',');
  const summaryParams = [
    'bucketId',
    'endDate',
    'includeCodeContributions',
    'includeCollaborations',
    'project',
    'startDate',
  ];

  it('makes three active_contributors calls with the slug as project and both flags at their defaults', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.pathname).toBe('/v0/pipes/active_contributors.json');
      expect(call.searchParams.get('project')).toBe('kubernetes');
      expect(call.searchParams.get('includeCodeContributions')).toBe('true');
      expect(call.searchParams.get('includeCollaborations')).toBe('false');
    }
  });

  it('sends only the bucket, the range and both flags, plus the granularity on the series call', async () => {
    await get(url());
    const sent = pipeCalls().map((call) => paramNames([...call.searchParams.keys()]));
    expect(sent.sort()).toEqual(
      [
        paramNames(summaryParams),
        paramNames(summaryParams),
        paramNames([...summaryParams, 'granularity']),
      ].sort(),
    );
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

async function getOperation(): Promise<OpenApiOperation | undefined> {
  const res = await get('/v1-alpha/openapi.json');
  expect(res.statusCode).toBe(200);
  return res.json<OpenApiDoc>().paths[contributorsPath('active-contributors')]?.get;
}

const responseSchema = async () =>
  (await getOperation())?.responses['200']?.content['application/json']?.schema;

describe('contribution flags (AC4)', () => {
  it('passes includeCodeContributions=false and includeCollaborations=true to all three calls', async () => {
    const res = await get(
      url({ includeCodeContributions: 'false', includeCollaborations: 'true' }),
    );
    expect(res.statusCode).toBe(200);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('includeCodeContributions')).toBe('false');
      expect(call.searchParams.get('includeCollaborations')).toBe('true');
    }
  });

  it.each(['includeCodeContributions', 'includeCollaborations'])(
    'rejects a %s value that is not a boolean',
    async (flag) => {
      const res = await get(url({ [flag]: 'maybe' }));
      expect(res.statusCode).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );

  it('publishes the range, the granularity and both flags, the flags as optional booleans with their defaults', async () => {
    const operation = await getOperation();
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual(
      [
        'endDate',
        'granularity',
        'includeCodeContributions',
        'includeCollaborations',
        'repos',
        'startDate',
      ].sort(),
    );
    const codeContributions = params.get('includeCodeContributions');
    expect(codeContributions?.required).toBeFalsy();
    expect(codeContributions?.schema).toMatchObject({ type: 'boolean', default: true });
    const collaborations = params.get('includeCollaborations');
    expect(collaborations?.required).toBeFalsy();
    expect(collaborations?.schema).toMatchObject({ type: 'boolean', default: false });
  });
});

describe('percentageChange (AC5)', () => {
  it('is negative when fewer contributors are active than in the previous period', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, contributorCount: 150 }],
        previous: [{ ...previousRow, contributorCount: 200 }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({
      current: 150,
      previous: 200,
      percentageChange: -25,
      changeValue: -50,
    });
  });

  it('is null when the previous period had no active contributors and the current one has some', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ contributorCount: 0, maintainerCount: 0, reviewerCount: 0 }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({
      current: 250,
      previous: 0,
      percentageChange: null,
      changeValue: 250,
    });
  });

  it('is 0 when neither period has active contributors', async () => {
    const none = [{ contributorCount: 0, maintainerCount: 0, reviewerCount: 0 }];
    mockFetch.mockImplementation(routeTinybird({ current: none, previous: none }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({
      current: 0,
      previous: 0,
      percentageChange: 0,
      changeValue: 0,
    });
  });
});

describe('empty results (AC6)', () => {
  it('returns zeros and an empty series when no call returns rows', async () => {
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

  it('reads a missing maintainerCount, reviewerCount or bucket contributorCount as 0', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ contributorCount: 250 }],
        series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      maintainerCount: 0,
      reviewerCount: 0,
      data: [{ startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), contributors: 0 }],
    });
  });

  it('drops a series row with a null bucket bound instead of formatting it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: null, endDate: null, contributorCount: 5 },
          { startDate: '2025-01-01', endDate: '2025-01-31', contributorCount: 180 },
          { startDate: '2025-02-01', endDate: null, contributorCount: 9 },
          { startDate: null, endDate: '2025-03-31', contributorCount: 4 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), contributors: 180 },
    ]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });
});

describe('OpenAPI (AC7)', () => {
  it('defines an active contributor by the activity the two contribution flags select', async () => {
    const description = (await getOperation())?.description;
    expect(description).toMatch(/at least one activity/i);
    expect(description).toMatch(/`includeCodeContributions`/);
    expect(description).toMatch(/`includeCollaborations`/);
  });

  it('defines a maintainer by the maintainer files of the project repositories, whatever role they give', async () => {
    const description = (await responseSchema())?.properties?.maintainerCount?.description;
    expect(description).toMatch(/maintainer file/i);
    expect(description).toMatch(/MAINTAINERS/);
    expect(description).toMatch(/CODEOWNERS/);
    expect(description).toMatch(/role/i);
  });

  it('defines a reviewer by review activity and ties reviewerCount to code contributions', async () => {
    const description = (await responseSchema())?.properties?.reviewerCount?.description;
    for (const platform of ['GitHub', 'GitLab', 'Gerrit']) {
      expect(description).toContain(platform);
    }
    expect(description).toMatch(/`includeCodeContributions`/);
  });

  it('says the edge buckets count only activity inside the period and buckets can outnumber the summary', async () => {
    const data = (await responseSchema())?.properties?.data;
    expect(data?.description).toMatch(/only activity inside the period/i);
    expect(data?.items?.properties?.contributors?.description).toMatch(/`summary\.current`/);
  });

  it('types the maintainer, reviewer, summary and bucket counts as integers', async () => {
    const schema = await responseSchema();
    expect(schema?.properties?.maintainerCount?.type).toBe('integer');
    expect(schema?.properties?.reviewerCount?.type).toBe('integer');
    expect(schema?.properties?.summary?.properties?.current?.type).toBe('integer');
    expect(schema?.properties?.data?.items?.properties?.contributors?.type).toBe('integer');
  });
});
