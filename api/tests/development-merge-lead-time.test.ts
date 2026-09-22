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

// The pipe answers one row of five Nullable(Float64) averages. approvedToMerged is null in the
// current row so the default fixture already exercises a stage without data.
const currentRow = {
  openedToMergedSeconds: 300000,
  openedToReviewAssignedSeconds: 30000,
  reviewAssignedToFirstReviewSeconds: 90000,
  firstReviewToApprovedSeconds: 30000,
  approvedToMergedSeconds: null,
};
const previousRow = {
  openedToMergedSeconds: 240000,
  openedToReviewAssignedSeconds: 20000,
  reviewAssignedToFirstReviewSeconds: 120000,
  firstReviewToApprovedSeconds: 30000,
  approvedToMergedSeconds: 80000,
};

const period = { periodFrom: isoDay(startDate), periodTo: isoDay(endDate) };
const stageKeys = ['summary', 'pickupSeconds', 'reviewSeconds', 'acceptedSeconds', 'mergedSeconds'];
const summaryKeys = [
  'current',
  'previous',
  'percentageChange',
  'changeValue',
  'periodFrom',
  'periodTo',
];

const expectedBody = {
  summary: {
    current: 300000,
    previous: 240000,
    percentageChange: 25,
    changeValue: 60000,
    ...period,
  },
  pickupSeconds: {
    current: 30000,
    previous: 20000,
    percentageChange: 50,
    changeValue: 10000,
    ...period,
  },
  reviewSeconds: {
    current: 90000,
    previous: 120000,
    percentageChange: -25,
    changeValue: -30000,
    ...period,
  },
  acceptedSeconds: {
    current: 30000,
    previous: 30000,
    percentageChange: 0,
    changeValue: 0,
    ...period,
  },
  mergedSeconds: {
    current: null,
    previous: 80000,
    percentageChange: null,
    changeValue: null,
    ...period,
  },
};

const nullSummary = {
  current: null,
  previous: null,
  percentageChange: null,
  changeValue: null,
  ...period,
};
const nullBody = {
  summary: nullSummary,
  pickupSeconds: nullSummary,
  reviewSeconds: nullSummary,
  acceptedSeconds: nullSummary,
  mergedSeconds: nullSummary,
};

interface PipeRows {
  bucket?: object[];
  current?: object[];
  previous?: object[];
}

const routeTinybird = ({
  bucket,
  current = [currentRow],
  previous = [previousRow],
}: PipeRows = {}) =>
  tinybirdStub(
    (url) => (url.searchParams.get('startDate') === atMidnight(previousStart) ? previous : current),
    bucket,
  );

const url = (params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') =>
  `/v1-alpha/projects/${slug}/development/merge-lead-time?${queryString({
    startDate,
    endDate,
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/development/merge-lead-time (AC1)', () => {
  it('returns the lead time summary and the four stages from the current and previous rows', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, unit: 'seconds', changeType: 'positive', extra: 'x' }],
        previous: [{ ...previousRow, extra: 'x' }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<Record<string, object>>();
    expect(Object.keys(body).sort()).toEqual([...stageKeys].sort());
    for (const key of stageKeys) {
      expect(Object.keys(body[key] ?? {}).sort()).toEqual([...summaryKeys].sort());
    }
    expect(res.body).not.toContain('changeType');
    expect(res.body).not.toContain('"unit"');
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes two pull_requests_merge_lead_time calls with the slug as project', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    const calls = pipeCalls();
    expect(calls).toHaveLength(2);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.pathname).toBe('/v0/pipes/pull_requests_merge_lead_time.json');
      expect(call.searchParams.get('project')).toBe('kubernetes');
    }
  });

  it('sends the current range on one call and the previous range on the other, without a granularity', async () => {
    await get(url());
    const ranges = pipeCalls().map((call) => [
      call.searchParams.get('startDate'),
      call.searchParams.get('endDate'),
    ]);
    expect(ranges).toHaveLength(2);
    expect(ranges).toEqual(
      expect.arrayContaining([
        [atMidnight(startDate), atMidnight(endDate)],
        [atMidnight(previousStart), atMidnight(previousEnd)],
      ]),
    );
    for (const call of pipeCalls()) {
      expect(call.searchParams.has('granularity')).toBe(false);
    }
  });
});

describe('stages without data (AC3)', () => {
  it('keeps the previous value and nulls the change when the current stage value is null', async () => {
    const res = await get(url());
    expect(res.json().mergedSeconds).toEqual({
      current: null,
      previous: 80000,
      percentageChange: null,
      changeValue: null,
      ...period,
    });
  });

  it('keeps the current value and nulls the change when the previous stage value is null', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ ...previousRow, openedToReviewAssignedSeconds: null }] }),
    );
    const res = await get(url());
    expect(res.json().pickupSeconds).toEqual({
      current: 30000,
      previous: null,
      percentageChange: null,
      changeValue: null,
      ...period,
    });
  });

  it('nulls a stage entirely when neither period has data for it', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, reviewAssignedToFirstReviewSeconds: null }],
        previous: [{ ...previousRow, reviewAssignedToFirstReviewSeconds: null }],
      }),
    );
    const res = await get(url());
    expect(res.json().reviewSeconds).toEqual(nullSummary);
  });

  it('applies the same null rules to summary', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ current: [{ ...currentRow, openedToMergedSeconds: null }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toEqual({
      current: null,
      previous: 240000,
      percentageChange: null,
      changeValue: null,
      ...period,
    });
  });

  it('treats an empty pipe result as a period without data', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: { ...nullSummary, previous: 240000 },
      pickupSeconds: { ...nullSummary, previous: 20000 },
      reviewSeconds: { ...nullSummary, previous: 120000 },
      acceptedSeconds: { ...nullSummary, previous: 30000 },
      mergedSeconds: { ...nullSummary, previous: 80000 },
    });
  });

  it('treats an empty previous result as a comparison period without data', async () => {
    mockFetch.mockImplementation(routeTinybird({ previous: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: { ...nullSummary, current: 300000 },
      pickupSeconds: { ...nullSummary, current: 30000 },
      reviewSeconds: { ...nullSummary, current: 90000 },
      acceptedSeconds: { ...nullSummary, current: 30000 },
      mergedSeconds: nullSummary,
    });
  });

  it('returns every value null when neither call has rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [], previous: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(nullBody);
  });

  it('returns every value null when both rows are all nulls', async () => {
    const nullRow = Object.fromEntries(Object.keys(currentRow).map((key) => [key, null]));
    mockFetch.mockImplementation(routeTinybird({ current: [nullRow], previous: [nullRow] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(nullBody);
  });

  it('returns every value null for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(nullBody);
    vi.restoreAllMocks();
  });
});

describe('percentageChange (AC4)', () => {
  it('is signed, positive for a longer current period and negative for a shorter one', async () => {
    const res = await get(url());
    expect(res.json().summary).toMatchObject({ percentageChange: 25, changeValue: 60000 });
    expect(res.json().reviewSeconds).toMatchObject({ percentageChange: -25, changeValue: -30000 });
  });

  it('is null when the previous average is 0 and the current one is not', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ ...previousRow, firstReviewToApprovedSeconds: 0 }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().acceptedSeconds).toEqual({
      current: 30000,
      previous: 0,
      percentageChange: null,
      changeValue: 30000,
      ...period,
    });
  });

  it('is 0 when both averages are 0', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, firstReviewToApprovedSeconds: 0 }],
        previous: [{ ...previousRow, firstReviewToApprovedSeconds: 0 }],
      }),
    );
    const res = await get(url());
    expect(res.json().acceptedSeconds).toEqual({
      current: 0,
      previous: 0,
      percentageChange: 0,
      changeValue: 0,
      ...period,
    });
  });
});

describe('request validation (AC6)', () => {
  it('defaults the range to 2010-01-01 through today when both dates are omitted', async () => {
    await atDate('2025-09-21T12:00:00Z', async () => {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      expect(res.json().summary).toMatchObject({
        periodFrom: isoDay('2010-01-01'),
        periodTo: isoDay('2025-09-21'),
      });
      const current = pipeCalls().find(
        (call) => call.searchParams.get('startDate') === atMidnight('2010-01-01'),
      );
      expect(current?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    });
  });

  it('accepts and ignores unknown query keys, granularity included', async () => {
    const res = await get(url({ granularity: 'monthly', foo: 'bar' }));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    for (const call of pipeCalls()) {
      expect(call.searchParams.has('granularity')).toBe(false);
      expect(call.searchParams.has('foo')).toBe(false);
    }
  });
});

describe('OpenAPI (AC9)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[developmentPath('merge-lead-time')]?.get;
  }

  it('types the seconds and the change of every stage as nullable numbers', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    for (const key of stageKeys) {
      const stage = schema?.properties?.[key];
      for (const field of ['current', 'previous', 'changeValue', 'percentageChange']) {
        expect(stage?.properties?.[field], `${key}.${field}`).toMatchObject({
          type: 'number',
          nullable: true,
        });
      }
    }
  });

  it('documents exactly the three shared query params, none required', async () => {
    const operation = await getOperation();
    const params = operation?.parameters?.filter((param) => param.in === 'query') ?? [];
    expect(params.map((param) => param.name).sort()).toEqual(['endDate', 'repos', 'startDate']);
    for (const param of params) {
      expect(param.required).toBeFalsy();
    }
  });
});
