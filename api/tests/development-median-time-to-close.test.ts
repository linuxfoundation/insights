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

// The summary node answers one row of a Nullable median; the series node fills a bucket without
// closed pull requests with 0, which February exercises.
const currentRow = { medianTimeToCloseSeconds: 172800 };
const previousRow = { medianTimeToCloseSeconds: 216000 };
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', medianTimeToCloseSeconds: 190800 },
  { startDate: '2025-02-01', endDate: '2025-02-28', medianTimeToCloseSeconds: 0 },
  { startDate: '2025-03-01', endDate: '2025-03-31', medianTimeToCloseSeconds: 154800 },
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
const bucketKeys = ['startDate', 'endDate', 'medianTimeToCloseSeconds'];

const expectedData = [
  {
    startDate: isoDay('2025-01-01'),
    endDate: isoDay('2025-01-31'),
    medianTimeToCloseSeconds: 190800,
  },
  { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), medianTimeToCloseSeconds: 0 },
  {
    startDate: isoDay('2025-03-01'),
    endDate: isoDay('2025-03-31'),
    medianTimeToCloseSeconds: 154800,
  },
];

const expectedBody = {
  summary: {
    current: 172800,
    previous: 216000,
    percentageChange: -20,
    changeValue: -43200,
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
  `/v1-alpha/projects/${slug}/development/median-time-to-close?${queryString({
    startDate,
    endDate,
    granularity: 'monthly',
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/development/median-time-to-close (AC1)', () => {
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
    expect(res.body).not.toContain('"unit"');
    expect(res.body).not.toContain('"day"');
  });

  it('keeps the series in the order the pipe returns it', async () => {
    mockFetch.mockImplementation(routeTinybird({ series: [...seriesRows].reverse() }));
    const res = await get(url());
    expect(res.json().data).toEqual([...expectedData].reverse());
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three median_time_to_close calls with the slug as project', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.pathname).toBe('/v0/pipes/median_time_to_close.json');
      expect(call.searchParams.get('project')).toBe('kubernetes');
    }
  });

  it('sends the current range twice, once with the granularity, and the previous range once without it', async () => {
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

  it('sends only the keys the pipe declares', async () => {
    await get(url({ repos: k8sRepo, platform: 'github' }));
    const declared = [
      'project',
      'bucketId',
      'repos',
      'platform',
      'startDate',
      'endDate',
      'granularity',
    ];
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      for (const key of call.searchParams.keys()) {
        expect(declared, `unexpected pipe param ${key}`).toContain(key);
      }
    }
  });
});

describe('platform filter (AC3)', () => {
  it.each(['github', 'gitlab', 'gerrit'])(
    'forwards platform=%s on all three pipe calls',
    async (platform) => {
      const res = await get(url({ platform }));
      expect(res.statusCode).toBe(200);
      const calls = pipeCalls();
      expect(calls).toHaveLength(3);
      for (const call of calls) {
        expect(call.searchParams.get('platform')).toBe(platform);
      }
    },
  );

  it('sends no platform key when the caller omits it', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.has('platform')).toBe(false);
    }
  });

  it.each([
    ['an unknown platform', 'bitbucket'],
    ['an empty value', ''],
    ['a capitalised value', 'GitHub'],
  ])('rejects %s with 400 before calling Tinybird', async (_case, platform) => {
    const res = await get(url({ platform }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('periods and buckets without closed pull requests (AC4)', () => {
  it('keeps the previous value and nulls the change when the current median is null', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [{ medianTimeToCloseSeconds: null }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, previous: 216000 });
    expect(res.json().data).toEqual(expectedData);
  });

  it('keeps the current value and nulls the change when the previous median is null', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ medianTimeToCloseSeconds: null }] }));
    const res = await get(url());
    expect(res.json().summary).toEqual({ ...nullSummary, current: 172800 });
  });

  it('nulls the whole summary when neither period has a median', async () => {
    const nullRow = { medianTimeToCloseSeconds: null };
    mockFetch.mockImplementation(routeTinybird({ current: [nullRow], previous: [nullRow] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual(nullSummary);
  });

  it('treats an empty summary result as a period without a median', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, previous: 216000 });
  });

  it('treats an empty previous result as a comparison period without a median', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [] }));
    const res = await get(url());
    expect(res.json().summary).toEqual({ ...nullSummary, current: 172800 });
  });

  it('returns a null summary and an empty series when no call has rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [], previous: [], series: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ summary: nullSummary, data: [] });
  });

  it('returns the same null summary and empty series for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ summary: nullSummary, data: [] });
    vi.restoreAllMocks();
  });

  it('passes a bucket median of 0 through as 0', async () => {
    const res = await get(url());
    expect(res.json().data[1]).toEqual({
      startDate: isoDay('2025-02-01'),
      endDate: isoDay('2025-02-28'),
      medianTimeToCloseSeconds: 0,
    });
  });

  it('drops a series row with a null bucket bound instead of formatting it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: null, endDate: null, medianTimeToCloseSeconds: 5 },
          seriesRows[0],
          { startDate: '2025-02-01', endDate: null, medianTimeToCloseSeconds: 9 },
          { startDate: null, endDate: '2025-03-31', medianTimeToCloseSeconds: 4 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([expectedData[0]]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });
});

describe('percentageChange (AC5)', () => {
  it('is negative when the current median is shorter than the previous one', async () => {
    const res = await get(url());
    expect(res.json().summary).toMatchObject({ percentageChange: -20, changeValue: -43200 });
  });

  it('is positive when the current median is longer than the previous one', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [previousRow], previous: [currentRow] }));
    const res = await get(url());
    expect(res.json().summary).toMatchObject({
      current: 216000,
      previous: 172800,
      percentageChange: 25,
      changeValue: 43200,
    });
  });

  it('is null when the previous median is 0 and the current one is not', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ medianTimeToCloseSeconds: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({
      current: 172800,
      previous: 0,
      percentageChange: null,
      changeValue: 172800,
      ...period,
    });
  });

  it('is 0 when both medians are 0', async () => {
    const zeroRow = { medianTimeToCloseSeconds: 0 };
    mockFetch.mockImplementation(routeTinybird({ current: [zeroRow], previous: [zeroRow] }));
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

describe('request validation (AC7)', () => {
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
    const res = await get(url({ foo: 'bar', collectionSlug: 'cncf' }));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    for (const call of pipeCalls()) {
      expect(call.searchParams.has('foo')).toBe(false);
      expect(call.searchParams.has('collectionSlug')).toBe(false);
    }
  });
});

describe('OpenAPI (AC10)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[developmentPath('median-time-to-close')]?.get;
  }

  it('names the three platforms in the description', async () => {
    const operation = await getOperation();
    expect(operation?.description).toMatch(/GitHub/);
    expect(operation?.description).toMatch(/GitLab/);
    expect(operation?.description).toMatch(/Gerrit/);
  });

  it('documents exactly five query params, with platform an optional enum', async () => {
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
    expect(platform?.schema).toMatchObject({
      type: 'string',
      enum: ['github', 'gitlab', 'gerrit'],
    });
  });

  it('types the summary numbers nullable, the dates date-time and the bucket median a number', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const summary = schema?.properties?.summary;
    for (const field of ['current', 'previous', 'changeValue', 'percentageChange']) {
      expect(summary?.properties?.[field], `summary.${field}`).toMatchObject({
        type: 'number',
        nullable: true,
      });
    }
    expect(summary?.properties?.periodFrom?.format).toBe('date-time');
    expect(summary?.properties?.periodTo?.format).toBe('date-time');

    const bucket = schema?.properties?.data?.items;
    expect(bucket?.properties?.startDate?.format).toBe('date-time');
    expect(bucket?.properties?.endDate?.format).toBe('date-time');
    expect(bucket?.properties?.medianTimeToCloseSeconds?.type).toBe('number');
  });
});
