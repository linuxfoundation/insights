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
const atMidnight = (day: string) => `${day} 00:00:00`;

// The rows of the Nuxt mock, in the order the pipe returns them: ascending size, which differs
// from the alphabetical order of the labels.
const pipeRows = [
  { gitChangedLinesBucket: '1-9', reviewedInSecondsAvg: 34017, pullRequestCount: 5 },
  { gitChangedLinesBucket: '10-59', reviewedInSecondsAvg: 30572, pullRequestCount: 20 },
  { gitChangedLinesBucket: '60-99', reviewedInSecondsAvg: 1581, pullRequestCount: 5 },
  { gitChangedLinesBucket: '100-499', reviewedInSecondsAvg: 122352, pullRequestCount: 14 },
  { gitChangedLinesBucket: '500+', reviewedInSecondsAvg: 288799, pullRequestCount: 28 },
];

const expectedBody = {
  data: [
    { lines: '1-9', prCount: 5, averageReviewTimeSeconds: 34017 },
    { lines: '10-59', prCount: 20, averageReviewTimeSeconds: 30572 },
    { lines: '60-99', prCount: 5, averageReviewTimeSeconds: 1581 },
    { lines: '100-499', prCount: 14, averageReviewTimeSeconds: 122352 },
    { lines: '500+', prCount: 28, averageReviewTimeSeconds: 288799 },
  ],
};

interface PipeRows {
  bucket?: object[];
  rows?: object[];
}

const routeTinybird = ({ bucket, rows = pipeRows }: PipeRows = {}) =>
  tinybirdStub(() => rows, bucket);

const url = (params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') =>
  `/v1-alpha/projects/${slug}/development/review-time-by-pr-size?${queryString({
    startDate,
    endDate,
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

describe('GET /v1-alpha/projects/{slug}/development/review-time-by-pr-size (AC1)', () => {
  it('returns one entry per size bucket in the pipe order', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping extra pipe fields', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ rows: pipeRows.map((row) => ({ ...row, sortId: 1, extra: 'x' })) }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body)).toEqual(['data']);
    expect(body.data).toHaveLength(pipeRows.length);
    for (const item of body.data) {
      expect(Object.keys(item).sort()).toEqual(['averageReviewTimeSeconds', 'lines', 'prCount']);
    }
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes one pipe call with the slug as project and the requested range', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(1);
    const call = calls[0];
    expect(call?.origin).toBe(tinybirdHost);
    expect(call?.pathname).toBe('/v0/pipes/pull_requests_review_time_by_size.json');
    expect(call?.searchParams.get('project')).toBe('kubernetes');
    expect(call?.searchParams.get('startDate')).toBe(atMidnight(startDate));
    expect(call?.searchParams.get('endDate')).toBe(atMidnight(endDate));
  });

  it('accepts a granularity query param and does not forward it', async () => {
    const res = await get(url({ granularity: 'monthly' }));
    expect(res.statusCode).toBe(200);
    expect(pipeCalls()).toHaveLength(1);
    expect(pipeCalls()[0]?.searchParams.has('granularity')).toBe(false);
  });

  it('defaults the range to 2010-01-01 through today when both dates are omitted', async () => {
    await atDate('2025-09-21T12:00:00Z', async () => {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      const call = pipeCalls()[0];
      expect(call?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
      expect(call?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    });
  });
});

describe('null average (AC3)', () => {
  it('passes a null average through with the pull request count intact', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        rows: [{ gitChangedLinesBucket: '60-99', reviewedInSecondsAvg: null, pullRequestCount: 5 }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [{ lines: '60-99', prCount: 5, averageReviewTimeSeconds: null }],
    });
  });

  it('keeps a zero average as 0 rather than null', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        rows: [{ gitChangedLinesBucket: '1-9', reviewedInSecondsAvg: 0, pullRequestCount: 3 }],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [{ lines: '1-9', prCount: 3, averageReviewTimeSeconds: 0 }],
    });
  });
});

describe('empty results (AC4)', () => {
  it('returns an empty data list when the pipe has no rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ rows: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
  });

  it('returns the same empty list for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
    vi.restoreAllMocks();
  });
});

describe('Tinybird failures (AC7)', () => {
  it.each([
    ['without the size label', { reviewedInSecondsAvg: 34017, pullRequestCount: 5 }],
    [
      'without the pull request count',
      { gitChangedLinesBucket: '1-9', reviewedInSecondsAvg: 34017 },
    ],
    [
      'with a numeric size label',
      { gitChangedLinesBucket: 9, reviewedInSecondsAvg: 1, pullRequestCount: 5 },
    ],
    [
      'with a string average',
      { gitChangedLinesBucket: '1-9', reviewedInSecondsAvg: 'fast', pullRequestCount: 5 },
    ],
    ['without the average', { gitChangedLinesBucket: '1-9', pullRequestCount: 5 }],
    [
      'with a fractional pull request count',
      { gitChangedLinesBucket: '1-9', reviewedInSecondsAvg: 1, pullRequestCount: 2.5 },
    ],
    [
      'with a negative pull request count',
      { gitChangedLinesBucket: '1-9', reviewedInSecondsAvg: 1, pullRequestCount: -1 },
    ],
    [
      'with a pull request count above the safe integer range',
      {
        gitChangedLinesBucket: '1-9',
        reviewedInSecondsAvg: 1,
        pullRequestCount: Number.MAX_SAFE_INTEGER + 1,
      },
    ],
  ])('maps a pipe row %s to 503 upstream_unavailable', async (_case, row) => {
    mockFetch.mockImplementation(routeTinybird({ rows: [...pipeRows, row] }));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('fast');
  });
});

describe('OpenAPI (AC9)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[developmentPath('review-time-by-pr-size')]?.get;
  }

  it('names the size labels and the first review in the description', async () => {
    const operation = await getOperation();
    for (const label of ['1-9', '10-59', '60-99', '100-499', '500+']) {
      expect(operation?.description).toContain(label);
    }
    expect(operation?.description).toMatch(/first review/i);
  });

  it('documents the type of every data field, with a nullable average', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const item = schema?.properties?.data?.items;
    expect(item?.properties?.lines).toMatchObject({ type: 'string' });
    expect(item?.properties?.prCount).toMatchObject({ type: 'integer' });
    expect(item?.properties?.averageReviewTimeSeconds).toMatchObject({
      type: 'number',
      nullable: true,
    });
  });

  it('documents exactly the repos, startDate and endDate query params', async () => {
    const operation = await getOperation();
    const names = operation?.parameters
      ?.filter((param) => param.in === 'query')
      .map((param) => param.name)
      .sort();
    expect(names).toEqual(['endDate', 'repos', 'startDate']);
  });
});
