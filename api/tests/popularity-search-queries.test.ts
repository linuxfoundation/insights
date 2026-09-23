// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import {
  callsTo,
  mockFetch,
  projectPath,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
  type OpenApiOperation,
} from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/popularity/search-queries';
const pipePath = '/v0/pipes/search_volume.json';

// Out of order, as the pipe applies no ORDER BY.
const pipeRows = [
  { insightsProjectId: 'p', project: 'kubernetes', dataTimestamp: '2024-03-01', volume: 900 },
  { insightsProjectId: 'p', project: 'kubernetes', dataTimestamp: '2024-01-01', volume: 700 },
  { insightsProjectId: 'p', project: 'kubernetes', dataTimestamp: '2024-02-01', volume: 800 },
];

const params = (url: URL) => Object.fromEntries(url.searchParams);

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname !== pipePath) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      return pipeRows;
    }),
  );
});

describe('response (AC1)', () => {
  it('returns one row per month, ending on the last day of the month, sorted by month', async () => {
    const res = await get(`${route}?startDate=2024-01-01&endDate=2024-03-31`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [
        { startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-31T00:00:00Z', queryCount: 700 },
        { startDate: '2024-02-01T00:00:00Z', endDate: '2024-02-29T00:00:00Z', queryCount: 800 },
        { startDate: '2024-03-01T00:00:00Z', endDate: '2024-03-31T00:00:00Z', queryCount: 900 },
      ],
    });
  });
});

describe('Tinybird call (AC2)', () => {
  it('sends the project and the requested range to search_volume once', async () => {
    await get(`${route}?startDate=2024-01-01&endDate=2024-03-31`);
    const calls = callsTo(pipePath);
    expect(calls).toHaveLength(1);
    expect(params(calls[0] as URL)).toMatchObject({
      project: 'kubernetes',
      startDate: '2024-01-01 00:00:00',
      endDate: '2024-03-31 00:00:00',
    });
  });

  it('defaults the range to 2010-01-01 through today', async () => {
    const before = new Date().toISOString().slice(0, 10);
    await get(route);
    const after = new Date().toISOString().slice(0, 10);
    const sent = params(callsTo(pipePath)[0] as URL);
    expect(sent.startDate).toBe('2010-01-01 00:00:00');
    expect([`${before} 00:00:00`, `${after} 00:00:00`]).toContain(sent.endDate);
  });
});

describe('malformed rows', () => {
  it('answers 503 when a dataTimestamp is not a calendar day', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => [{ dataTimestamp: '2024-13-45', volume: 1 }]));
    const res = await get(route);
    expect(res.statusCode).toBe(503);
  });

  it('answers 503 when a dataTimestamp names a day the month does not have', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => [{ dataTimestamp: '2024-02-31', volume: 1 }]));
    const res = await get(route);
    expect(res.statusCode).toBe(503);
  });
});

describe('OpenAPI (AC4)', () => {
  it('takes startDate and endDate only', async () => {
    const res = await get('/v1-alpha/openapi.json');
    const operation = res.json<OpenApiDoc>().paths[projectPath('popularity/search-queries')]
      ?.get as OpenApiOperation | undefined;
    expect(operation, 'search-queries is missing from the spec').toBeDefined();
    const query = operation?.parameters?.filter((p) => p.name !== 'slug').map((p) => p.name);
    expect(query?.sort()).toEqual(['endDate', 'startDate']);
  });
});
