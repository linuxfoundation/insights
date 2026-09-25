// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import {
  callsTo,
  mockFetch,
  pipeCalls,
  projectPath,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
  type OpenApiOperation,
  type PipeResponder,
} from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/popularity/mailing-lists-messages';
const baseQuery = 'startDate=2025-01-01&endDate=2025-03-31&granularity=monthly';

const currentStart = '2025-01-01 00:00:00';
const previousStart = '2024-10-01 00:00:00';

const monthlyRows = [
  {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    activityCount: 30,
    cumulativeActivityCount: 530,
  },
  {
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    activityCount: 20,
    cumulativeActivityCount: 550,
  },
  {
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    activityCount: 30,
    cumulativeActivityCount: 580,
  },
];

const activitiesCount = '/v0/pipes/activities_count.json';
const cumulativeCount = '/v0/pipes/activities_cumulative_count.json';
const isSeries = (url: URL) => url.searchParams.has('granularity');
const params = (url: URL) => Object.fromEntries(url.searchParams);

function stubTinybird(
  summaryCounts: Record<string, number> = { [currentStart]: 80, [previousStart]: 100 },
) {
  const pipes: Record<string, PipeResponder> = {
    [activitiesCount]: (url) =>
      isSeries(url)
        ? monthlyRows
        : [{ activityCount: summaryCounts[url.searchParams.get('startDate') ?? ''] ?? 0 }],
    [cumulativeCount]: () => monthlyRows,
  };
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      const respond = pipes[url.pathname];
      if (!respond) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      return respond(url);
    }),
  );
}

const expectedSummary = {
  current: 80,
  previous: 100,
  percentageChange: -20,
  changeValue: -20,
  periodFrom: '2025-01-01T00:00:00Z',
  periodTo: '2025-03-31T00:00:00Z',
};

const bucket = (startDate: string, endDate: string, messages: number) => ({
  startDate: `${startDate}T00:00:00Z`,
  endDate: `${endDate}T00:00:00Z`,
  messages,
});

const { get } = useApp();

beforeEach(() => {
  stubTinybird();
});

describe('response (AC1, AC5)', () => {
  it('returns the signed period summary and new messages per bucket by default', async () => {
    const res = await get(`${route}?${baseQuery}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: expectedSummary,
      data: [
        bucket('2025-01-01', '2025-01-31', 30),
        bucket('2025-02-01', '2025-02-28', 20),
        bucket('2025-03-01', '2025-03-31', 30),
      ],
    });
    expect(callsTo(cumulativeCount)).toHaveLength(0);
  });
});

describe('Tinybird calls (AC2)', () => {
  it('counts groups.io messages on every call with the Nuxt flags', async () => {
    await get(`${route}?${baseQuery}`);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const url of calls) {
      expect(url.pathname).toBe(activitiesCount);
      expect(params(url)).toMatchObject({
        activity_type: 'message',
        onlyContributions: 'false',
        includeCodeContributions: 'true',
        includeCollaborations: 'true',
        platform: 'groupsio',
      });
      expect(url.searchParams.has('includeOtherContributions')).toBe(false);
    }
    expect(calls.filter(isSeries)).toHaveLength(1);
  });
});

describe('countType=cumulative (AC3)', () => {
  it('returns the running total per bucket and keeps the summary on messages sent in the period', async () => {
    const res = await get(`${route}?${baseQuery}&countType=cumulative`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: expectedSummary,
      data: [
        bucket('2025-01-01', '2025-01-31', 530),
        bucket('2025-02-01', '2025-02-28', 550),
        bucket('2025-03-01', '2025-03-31', 580),
      ],
    });

    const series = callsTo(cumulativeCount);
    expect(series).toHaveLength(1);
    expect(params(series[0] as URL)).toMatchObject({
      activity_type: 'message',
      granularity: 'monthly',
    });
    expect(callsTo(activitiesCount).filter(isSeries)).toHaveLength(0);
  });
});

describe('fixed activity type and platform (AC4)', () => {
  it('ignores activityType and platform query parameters', async () => {
    const res = await get(`${route}?${baseQuery}&activityType=star&platform=github`);
    expect(res.statusCode).toBe(200);
    for (const url of pipeCalls()) {
      expect(url.searchParams.get('activity_type')).toBe('message');
      expect(url.searchParams.get('platform')).toBe('groupsio');
    }
  });
});

describe('OpenAPI (AC6)', () => {
  async function getOperation(): Promise<OpenApiOperation> {
    const res = await get('/v1-alpha/openapi.json');
    const operation =
      res.json<OpenApiDoc>().paths[projectPath('popularity/mailing-lists-messages')]?.get;
    expect(operation, 'messages is missing from the spec').toBeDefined();
    return operation as OpenApiOperation;
  }

  it('documents countType as an optional new or cumulative switch and messages as an integer', async () => {
    const operation = await getOperation();
    const countType = operation.parameters?.find((p) => p.name === 'countType');
    expect(countType?.required).toBeFalsy();
    expect(countType?.schema.enum).toEqual(['new', 'cumulative']);
    expect(countType?.schema.default).toBe('new');

    const schema = operation.responses['200']?.content['application/json']?.schema;
    expect(schema?.properties?.data?.items?.properties?.messages?.type).toBe('integer');
  });
});
