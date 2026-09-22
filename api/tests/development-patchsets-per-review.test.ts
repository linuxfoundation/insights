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

const commonRepo = 'https://gerrit.onap.org/r/aai/common';
const schemaRepo = 'https://gerrit.onap.org/r/aai/schema-service';

// The summary node answers one row of a Nullable(Float64); the series node LEFT JOINs onto a
// generated timeseries, so a bucket without changesets is present with 0.
const currentRow = { patchsetsPerReview: 2.5 };
const previousRow = { patchsetsPerReview: 2 };
const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', patchsetsPerReview: 3 },
  { startDate: '2025-02-01', endDate: '2025-02-28', patchsetsPerReview: 0 },
  { startDate: '2025-03-01', endDate: '2025-03-31', patchsetsPerReview: 2.5 },
];

const period = { periodFrom: isoDay(startDate), periodTo: isoDay(endDate) };
const expectedData = [
  { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), value: 3 },
  { startDate: isoDay('2025-02-01'), endDate: isoDay('2025-02-28'), value: 0 },
  { startDate: isoDay('2025-03-01'), endDate: isoDay('2025-03-31'), value: 2.5 },
];
const expectedBody = {
  summary: { current: 2.5, previous: 2, percentageChange: 25, changeValue: 0.5, ...period },
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

const summaryKeys = [
  'current',
  'previous',
  'percentageChange',
  'changeValue',
  'periodFrom',
  'periodTo',
];

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

const url = (params: Record<string, string | string[] | undefined> = {}, slug = 'onap') =>
  `/v1-alpha/projects/${slug}/development/patchsets-per-review?${queryString({
    startDate,
    endDate,
    granularity: 'monthly',
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/development/patchsets-per-review (AC1)', () => {
  it('returns the patchsets summary and one value per granularity step', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it("returns only the documented keys, dropping extra pipe fields and Nuxt's median and average", async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, median: 9, average: 9, extra: 'x' }],
        series: seriesRows.map((row) => ({ ...row, median: 9, average: 9, extra: 'x' })),
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ summary: object; data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'summary']);
    expect(Object.keys(body.summary).sort()).toEqual([...summaryKeys].sort());
    for (const bucket of body.data) {
      expect(Object.keys(bucket).sort()).toEqual(['endDate', 'startDate', 'value']);
    }
    expect(res.body).not.toContain('"median"');
    expect(res.body).not.toContain('"average"');
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes three patchsets_per_review calls with the slug as project', async () => {
    await get(url({ repos: [commonRepo, schemaRepo] }));
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.pathname).toBe('/v0/pipes/patchsets_per_review.json');
      expect(call.searchParams.get('project')).toBe('onap');
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

describe('stat (AC3)', () => {
  it('sends dataType=median on every pipe call when stat is omitted', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('dataType')).toBe('median');
    }
  });

  it('sends dataType=average on every pipe call for stat=average', async () => {
    const res = await get(url({ stat: 'average' }));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('dataType')).toBe('average');
    }
  });

  it.each(['mean', 'Median', ''])('rejects stat=%s before calling Tinybird', async (stat) => {
    const res = await get(url({ stat }));
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Nuxt's name for the parameter is an unknown key here: accepted and ignored like any other.
  it('ignores a dataType query key and still sends dataType=median', async () => {
    const res = await get(url({ dataType: 'average' }));
    expect(res.statusCode).toBe(200);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('dataType')).toBe('median');
    }
  });
});

describe('periods without changesets (AC4)', () => {
  it('keeps the previous value and nulls the change when the current value is null', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [{ patchsetsPerReview: null }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: { ...nullSummary, previous: 2 },
      data: expectedData,
    });
  });

  it('keeps the current value and nulls the change when the previous value is null', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ patchsetsPerReview: null }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, current: 2.5 });
  });

  it('nulls every value when neither period has changesets', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ patchsetsPerReview: null }],
        previous: [{ patchsetsPerReview: null }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual(nullSummary);
  });

  it('treats an empty current result as a period without changesets', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, previous: 2 });
  });

  it('treats an empty previous result as a comparison period without changesets', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({ ...nullSummary, current: 2.5 });
  });

  it('returns a null summary and no buckets for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(emptyBody);
    vi.restoreAllMocks();
  });
});

describe('percentageChange (AC5)', () => {
  it('is negative when the current period needs fewer patchsets', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ patchsetsPerReview: 2 }],
        previous: [{ patchsetsPerReview: 4 }],
      }),
    );
    const res = await get(url());
    expect(res.json().summary).toMatchObject({
      current: 2,
      previous: 4,
      percentageChange: -50,
      changeValue: -2,
    });
  });

  it('is null when the previous value is 0 and the current one is not', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [{ patchsetsPerReview: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({
      current: 2.5,
      previous: 0,
      percentageChange: null,
      changeValue: 2.5,
    });
  });
});

describe('series buckets (AC6)', () => {
  it("keeps the pipe's 0 for a bucket without changesets", async () => {
    const res = await get(url());
    expect(res.json().data[1]).toEqual(expectedData[1]);
  });

  it('reports 0 for a bucket row without a patchsetsPerReview', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ series: [{ startDate: '2025-01-01', endDate: '2025-01-31' }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), value: 0 },
    ]);
  });

  it('drops a series row with a null bucket bound instead of formatting it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        series: [
          { startDate: null, endDate: null, patchsetsPerReview: 5 },
          { startDate: '2025-01-01', endDate: '2025-01-31', patchsetsPerReview: 3 },
          { startDate: '2025-02-01', endDate: null, patchsetsPerReview: 9 },
          { startDate: null, endDate: '2025-03-31', patchsetsPerReview: 4 },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      { startDate: isoDay('2025-01-01'), endDate: isoDay('2025-01-31'), value: 3 },
    ]);
    expect(res.body).not.toContain('nullT00:00:00Z');
  });

  it('returns an empty data list with the summary when the series has no rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ series: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ summary: expectedBody.summary, data: [] });
  });
});

describe('OpenAPI (AC11)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[developmentPath('patchsets-per-review')]?.get;
  }

  it('states that the data is Gerrit only and the period starts at 00:00 UTC', async () => {
    const operation = await getOperation();
    expect(operation?.description).toMatch(/Gerrit/);
    expect(operation?.description).toMatch(/00:00 UTC/);
  });

  it('types the summary values as nullable numbers in patchsets per review and each bucket value as a number', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const bucket = schema?.properties?.data?.items;
    expect(bucket?.properties?.value?.type).toBe('number');
    const summary = schema?.properties?.summary;
    for (const field of ['current', 'previous', 'changeValue', 'percentageChange']) {
      expect(summary?.properties?.[field], `summary.${field}`).toMatchObject({
        type: 'number',
        nullable: true,
      });
    }
    expect(summary?.properties?.current?.description).toContain('(patchsets per review)');
  });

  it('documents the query params, with stat an enum defaulting to median', async () => {
    const operation = await getOperation();
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual(
      ['endDate', 'granularity', 'repos', 'startDate', 'stat'].sort(),
    );
    const stat = params.get('stat');
    expect(stat?.required).toBeFalsy();
    expect(stat?.schema).toMatchObject({
      type: 'string',
      enum: ['median', 'average'],
      default: 'median',
    });
  });
});
