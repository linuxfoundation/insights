// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildApp } from '../src/app.js';
import { getTinybirdClient } from '../src/clients/tinybird.js';

const tinybirdHost = 'https://tinybird.test';
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const activeContributorsPath = '/v0/pipes/active_contributors.json';
const leaderboardPath = '/v0/pipes/contributors_leaderboard.json';
const bucketPath = '/v0/pipes/project_buckets.json';
const specPath = '/v1-alpha/projects/{slug}/development/code-review-participants';

const startDate = '2025-01-01';
const endDate = '2025-03-31';
// getPreviousDates shifts the range back by its calendar span (2 months 30 days here), ending
// the day before startDate.
const previousStart = '2024-10-01';
const previousEnd = '2024-12-31';
const atMidnight = (day: string) => `${day} 00:00:00`;
const isoDay = (day: string) => `${day}T00:00:00Z`;

const k8sRepo = 'https://github.com/kubernetes/kubernetes';
const websiteRepo = 'https://github.com/kubernetes/website';

// The wire value the pipes receive, pinned as literals so a renamed enum member shows up here.
const participantActivityTypes = [
  'pull_request-reviewed',
  'pull_request-assigned',
  'pull_request-comment',
  'pull_request-review-thread-comment',
  'pull_request-opened',
  'pull_request-review-requested',
  'merge_request-review-changes-requested',
  'merge_request-review-approved',
  'merge_request-assigned',
  'merge_request-comment',
  'merge_request-review-requested',
  'merge_request-opened',
  'changeset-created',
  'changeset_comment-created',
  'patchset_comment-created',
  'patchset_approval-created',
].join(',');

const currentRow = { contributorCount: 46, maintainerCount: 5, reviewerCount: 12 };
const previousRow = { contributorCount: 23, maintainerCount: 4, reviewerCount: 9 };
// The leaderboard pipe returns more than the endpoint documents; the extras must be dropped.
const leaderboardRows = [
  {
    id: '0f89b020-0efa-11f0-a5ee-ef0edc2f881d',
    avatar: 'https://avatars.githubusercontent.com/in/347564?v=4',
    displayName: 'coderabbitai',
    contributionCount: 762,
    contributionPercentage: 73,
    roles: [],
  },
  {
    id: 'ed8f5fc0-0ef8-11f0-a5ee-ef0edc2f881d',
    avatar: 'https://avatars.githubusercontent.com/u/20134207?v=4',
    displayName: 'joanagmaia',
    contributionCount: 89,
    contributionPercentage: 8.5,
    roles: ['maintainer'],
    githubHandleArray: ['joanagmaia'],
  },
  {
    id: '1a2b3c40-0ef8-11f0-a5ee-ef0edc2f881d',
    avatar: 'https://avatars.githubusercontent.com/u/1006262?v=4',
    displayName: 'sausage-todd',
    contributionCount: 40,
    contributionPercentage: 3.8,
    roles: ['contributor'],
  },
];

const expectedBody = {
  summary: {
    current: 46,
    previous: 23,
    percentageChange: 100,
    changeValue: 23,
    periodFrom: isoDay(startDate),
    periodTo: isoDay(endDate),
  },
  data: [
    {
      name: 'coderabbitai',
      avatar: 'https://avatars.githubusercontent.com/in/347564?v=4',
      activityCount: 762,
      activityPercentage: 73,
    },
    {
      name: 'joanagmaia',
      avatar: 'https://avatars.githubusercontent.com/u/20134207?v=4',
      activityCount: 89,
      activityPercentage: 8.5,
    },
    {
      name: 'sausage-todd',
      avatar: 'https://avatars.githubusercontent.com/u/1006262?v=4',
      activityCount: 40,
      activityPercentage: 3.8,
    },
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

const tinybirdResponse = (rows: object[]) =>
  new Response(
    JSON.stringify({
      data: rows,
      meta: [],
      rows: rows.length,
      statistics: { elapsed: 0.01, rows_read: 1, bytes_read: 1 },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );

interface PipeRows {
  bucket?: object[];
  current?: object[];
  previous?: object[];
  leaderboard?: object[];
}

// The handler resolves the slug to a bucket once, then makes the three pipe calls. The two
// active_contributors calls differ by their startDate; the leaderboard has its own pipe path.
const routeTinybird =
  ({
    bucket = [{ bucketId: 7 }],
    current = [currentRow],
    previous = [previousRow],
    leaderboard = leaderboardRows,
  }: PipeRows = {}) =>
  async (input: unknown) => {
    const url = new URL(String(input));
    if (url.pathname === bucketPath) {
      return tinybirdResponse(bucket);
    }
    if (url.pathname === leaderboardPath) {
      return tinybirdResponse(leaderboard);
    }
    const isPrevious = url.searchParams.get('startDate') === atMidnight(previousStart);
    return tinybirdResponse(isPrevious ? previous : current);
  };

const callsTo = (path: string) =>
  mockFetch.mock.calls
    .map((call) => new URL(String(call[0])))
    .filter((url) => url.pathname === path);
const pipeCalls = () => [...callsTo(activeContributorsPath), ...callsTo(leaderboardPath)];

const defaultQuery = { startDate, endDate };

function url(params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...defaultQuery, ...params })) {
    for (const item of [value].flat()) {
      if (item !== undefined) {
        search.append(key, item);
      }
    }
  }
  return `/v1-alpha/projects/${slug}/development/code-review-participants?${search}`;
}

interface OpenApiSchema {
  type?: string;
  description?: string;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  enum?: string[];
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
}

interface OpenApiParameter {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema: OpenApiSchema;
}

interface OpenApiOperation {
  tags?: string[];
  description?: string;
  parameters?: OpenApiParameter[];
  responses: Record<string, { content: Record<string, { schema: OpenApiSchema }> }>;
}

interface OpenApiDoc {
  paths: Record<string, { get?: OpenApiOperation }>;
}

let app: FastifyInstance;

beforeAll(async () => {
  vi.stubEnv('API_TB_HOST', tinybirdHost);
  vi.stubEnv('API_TB_TOKEN', 'test-token');
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  vi.unstubAllEnvs();
});

beforeEach(async () => {
  // The client remembers a slug's bucket for the whole process; each test counts its own lookup.
  await getTinybirdClient().clearAllBucketCaches();
  mockFetch.mockReset().mockImplementation(routeTinybird());
});

const get = (path: string) => app.inject({ method: 'GET', url: path });

describe('GET /v1-alpha/projects/{slug}/development/code-review-participants (AC1)', () => {
  it('returns the participant count summary and the top participants', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
  });

  it('returns only the documented keys, dropping the extra pipe fields', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    const body = res.json<{ data: object[] }>();
    expect(Object.keys(body).sort()).toEqual(['data', 'summary']);
    expect(body.data).toHaveLength(3);
    for (const participant of body.data) {
      expect(Object.keys(participant).sort()).toEqual([
        'activityCount',
        'activityPercentage',
        'avatar',
        'name',
      ]);
    }
    expect(res.body).not.toContain('roles');
    expect(res.body).not.toContain('githubHandleArray');
    expect(res.body).not.toContain('maintainerCount');
  });
});

describe('Tinybird calls (AC2)', () => {
  it('makes two active_contributors calls and one contributors_leaderboard call with the slug as project, the participant activity types and the repos', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    expect(callsTo(activeContributorsPath)).toHaveLength(2);
    expect(callsTo(leaderboardPath)).toHaveLength(1);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.searchParams.get('project')).toBe('kubernetes');
      expect(call.searchParams.get('activity_types')).toBe(participantActivityTypes);
      expect(call.searchParams.get('repos')).toBe(`${k8sRepo},${websiteRepo}`);
    }
  });

  it('resolves the project bucket once and sends its id on every pipe call', async () => {
    await get(url());
    const lookups = callsTo(bucketPath);
    expect(lookups).toHaveLength(1);
    expect(lookups[0]?.searchParams.get('project')).toBe('kubernetes');
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('bucketId')).toBe('7');
    }
  });

  it('treats bucket id 0 as a real bucket and forwards it', async () => {
    mockFetch.mockImplementation(routeTinybird({ bucket: [{ bucketId: 0 }] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.get('bucketId')).toBe('0');
    }
  });

  it('sends the current range to one summary call and the leaderboard, the previous range to the other summary call, and no granularity', async () => {
    await get(url());
    const range = (call: URL) => [
      call.searchParams.get('startDate'),
      call.searchParams.get('endDate'),
    ];
    expect(callsTo(activeContributorsPath).map(range)).toEqual(
      expect.arrayContaining([
        [atMidnight(startDate), atMidnight(endDate)],
        [atMidnight(previousStart), atMidnight(previousEnd)],
      ]),
    );
    expect(callsTo(leaderboardPath).map(range)).toEqual([
      [atMidnight(startDate), atMidnight(endDate)],
    ]);
    for (const call of pipeCalls()) {
      expect(call.searchParams.has('granularity')).toBe(false);
    }
  });

  it('omits repos from the pipe calls when the caller sends none', async () => {
    await get(url());
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.has('repos')).toBe(false);
    }
  });

  it('drops an empty repos value instead of sending it to the pipe as a filter', async () => {
    await get(url({ repos: '' }));
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.searchParams.has('repos')).toBe(false);
    }
  });

  it('issues the three pipe calls concurrently', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const respond = routeTinybird();
    mockFetch.mockImplementation(async (input: unknown) => {
      if (new URL(String(input)).pathname === bucketPath) {
        return respond(input);
      }
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return respond(input);
    });
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(maxInFlight).toBe(3);
  });
});

describe('limit (AC3)', () => {
  it('sends limit=5 to the leaderboard by default and no limit to the summary calls', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(callsTo(leaderboardPath)[0]?.searchParams.get('limit')).toBe('5');
    for (const call of callsTo(activeContributorsPath)) {
      expect(call.searchParams.has('limit')).toBe(false);
    }
  });

  it("forwards the caller's limit to the leaderboard call", async () => {
    const res = await get(url({ limit: '20' }));
    expect(res.statusCode).toBe(200);
    expect(callsTo(leaderboardPath)[0]?.searchParams.get('limit')).toBe('20');
  });

  it('accepts the maximum of 50', async () => {
    const res = await get(url({ limit: '50' }));
    expect(res.statusCode).toBe(200);
    expect(callsTo(leaderboardPath)[0]?.searchParams.get('limit')).toBe('50');
  });

  it.each(['0', '51', '2.5', 'abc'])(
    'rejects limit=%s with 400 before calling Tinybird',
    async (limit) => {
      const res = await get(url({ limit }));
      expect(res.statusCode).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );
});

describe('percentageChange (AC4)', () => {
  it('is negative when the current period has fewer participants', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        current: [{ ...currentRow, contributorCount: 50 }],
        previous: [{ ...previousRow, contributorCount: 100 }],
      }),
    );
    const res = await get(url());
    expect(res.json().summary).toMatchObject({
      current: 50,
      previous: 100,
      percentageChange: -50,
      changeValue: -50,
    });
  });

  it('is null when the previous period had no participants and the current one has some', async () => {
    mockFetch.mockImplementation(
      routeTinybird({ previous: [{ ...previousRow, contributorCount: 0 }] }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({ current: 46, previous: 0, percentageChange: null });
  });
});

describe('empty results (AC5)', () => {
  it('returns zeros and an empty list when the pipes have no rows', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [], previous: [], leaderboard: [] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(zeroBody);
  });

  it('reports 0 for a participant row without a count or a percentage', async () => {
    mockFetch.mockImplementation(
      routeTinybird({
        leaderboard: [
          { avatar: 'https://avatars.githubusercontent.com/u/1?v=4', displayName: 'octocat' },
        ],
      }),
    );
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([
      {
        name: 'octocat',
        avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
        activityCount: 0,
        activityPercentage: 0,
      },
    ]);
  });
});

describe('unknown slug (AC6)', () => {
  beforeEach(() => {
    // The Tinybird client warns about the missing bucket; keep the test output readable.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with zeros after only the bucket lookup when the slug has no bucket', async () => {
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(zeroBody);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(callsTo(bucketPath)[0]?.searchParams.get('project')).toBe('no-such-project');
    expect(pipeCalls()).toHaveLength(0);
  });
});

describe('request validation (AC7)', () => {
  it('rejects a timestamp in startDate', async () => {
    const res = await get(url({ startDate: '2025-01-01T00:00:00Z' }));
    expect(res.statusCode).toBe(400);
  });

  it('rejects an inverted range with invalid_request before calling Tinybird', async () => {
    const res = await get(url({ startDate: endDate, endDate: startDate }));
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('invalid_request');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('ignores an unknown query key', async () => {
    const res = await get(url({ granularity: 'monthly', metric: 'pr-participants' }));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(expectedBody);
    for (const call of pipeCalls()) {
      expect(call.searchParams.has('granularity')).toBe(false);
      expect(call.searchParams.has('metric')).toBe(false);
    }
  });

  it('defaults the range to 2010-01-01 through today when both dates are omitted', async () => {
    // Only Date is faked, so the Tinybird client's real timers keep running and the request
    // cannot straddle a UTC midnight between the handler and the assertion.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2025-09-21T12:00:00Z'));
    try {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      expect(res.json().summary).toMatchObject({
        periodFrom: isoDay('2010-01-01'),
        periodTo: isoDay('2025-09-21'),
      });
      const leaderboard = callsTo(leaderboardPath)[0];
      expect(leaderboard?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
      expect(leaderboard?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('Tinybird failures (AC8)', () => {
  const upstreamDetail = 'tinybird internal detail';
  // Fails only the calls to `path`; every other Tinybird call answers normally.
  const failing = (
    respondWith: () => Response | Promise<Response>,
    path = activeContributorsPath,
  ) => {
    const respond = routeTinybird();
    return async (input: unknown) =>
      new URL(String(input)).pathname === path ? respondWith() : respond(input);
  };
  const httpError = (status: number, statusText: string) => () =>
    new Response(upstreamDetail, { status, statusText });
  const networkError = () => Promise.reject(new TypeError(`fetch failed: ${upstreamDetail}`));

  beforeEach(() => {
    // The Tinybird client logs every failed request; keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 404 is in the table because the empty-data answer comes from the handler's null bucket id;
  // a 404 from the pipe itself is an outage.
  it.each([
    [500, 'Internal Server Error'],
    [404, 'Not Found'],
    [401, 'Unauthorized'],
    [429, 'Too Many Requests'],
  ])('maps an active_contributors %i to 503 upstream_unavailable', async (status, statusText) => {
    mockFetch.mockImplementation(failing(httpError(status, statusText)));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a failing contributors_leaderboard call alone to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(failing(httpError(500, 'Internal Server Error'), leaderboardPath));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
  });

  it('maps a failing bucket lookup to 503 upstream_unavailable without calling the pipes', async () => {
    mockFetch.mockImplementation(failing(httpError(500, 'Internal Server Error'), bucketPath));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
    expect(pipeCalls()).toHaveLength(0);
  });

  it('maps a pipe network error to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(failing(networkError));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
    // The client retries a network error, so only the path matters: the lookup succeeded and
    // the failure came from the pipe.
    expect(pipeCalls()).not.toHaveLength(0);
  });

  it('maps a bucket lookup network error to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(failing(networkError, bucketPath));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain(upstreamDetail);
    expect(pipeCalls()).toHaveLength(0);
  });

  it('maps a pipe response that is not JSON to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(failing(() => new Response('<html>oops</html>', { status: 200 })));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('oops');
  });
});

describe('caching headers (AC9)', () => {
  it('sets Cache-Control: private, max-age=0 on a successful response', async () => {
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('sets the same header on a 503', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValue(new TypeError('fetch failed'));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
    vi.restoreAllMocks();
  });
});

describe('OpenAPI (AC10)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[specPath]?.get;
  }

  it('lists the route in /v1-alpha/openapi.json tagged Development', async () => {
    const operation = await getOperation();
    expect(operation?.tags).toEqual(['Development']);
  });

  it('documents every field of the 200 response', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    const fields = ['summary', 'data'];
    expect(schema?.required).toEqual(expect.arrayContaining(fields));
    for (const field of fields) {
      expect(schema?.properties?.[field]?.description, `${field} has no description`).toBeTruthy();
    }
    const participant = schema?.properties?.data?.items;
    const participantFields = ['name', 'avatar', 'activityCount', 'activityPercentage'];
    expect(participant?.required).toEqual(expect.arrayContaining(participantFields));
    for (const field of participantFields) {
      expect(
        participant?.properties?.[field]?.description,
        `${field} has no description`,
      ).toBeTruthy();
    }
    expect(participant?.properties?.activityCount?.type).toBe('integer');
    const summary = schema?.properties?.summary;
    const summaryFields = [
      'current',
      'previous',
      'percentageChange',
      'changeValue',
      'periodFrom',
      'periodTo',
    ];
    expect(summary?.required).toEqual(expect.arrayContaining(summaryFields));
    for (const field of summaryFields) {
      expect(
        summary?.properties?.[field]?.description,
        `summary.${field} has no description`,
      ).toBeTruthy();
    }
    expect(summary?.properties?.current?.type).toBe('integer');
  });

  it('documents the query params, with limit an integer from 1 to 50 defaulting to 5 and no granularity', async () => {
    const operation = await getOperation();
    // The operation also lists the slug path parameter; only the query params are under test.
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual(['endDate', 'limit', 'repos', 'startDate']);
    const limit = params.get('limit');
    expect(limit?.required).toBeFalsy();
    expect(limit?.schema).toMatchObject({ type: 'integer', default: 5, minimum: 1, maximum: 50 });
    expect(limit?.description ?? limit?.schema.description).toBeTruthy();
  });

  it('ends the description by marking the participant identity fields provisional', async () => {
    const operation = await getOperation();
    expect(
      operation?.description
        ?.trim()
        .endsWith('Participant identity fields are provisional in /v1-alpha.'),
    ).toBe(true);
  });

  it('keeps the route out of /v1', async () => {
    const spec = await get('/v1/openapi.json');
    expect(Object.keys(spec.json<OpenApiDoc>().paths)).not.toContain(
      '/v1/projects/{slug}/development/code-review-participants',
    );
    const res = await get('/v1/projects/kubernetes/development/code-review-participants');
    expect(res.statusCode).toBe(404);
  });
});

describe('malformed pipe rows (AC11)', () => {
  const avatar = 'https://avatars.githubusercontent.com/u/1?v=4';

  it.each([
    ['a string contributorCount', { contributorCount: 'many' }],
    ['a fractional contributorCount', { contributorCount: 12.5 }],
    ['a null contributorCount', { contributorCount: null }],
  ])('maps a summary row with %s to 503 upstream_unavailable', async (_, row) => {
    mockFetch.mockImplementation(routeTinybird({ current: [row] }));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('many');
  });

  it('counts 0 participants for a summary row without a contributorCount', async () => {
    mockFetch.mockImplementation(routeTinybird({ current: [{}], previous: [{}] }));
    const res = await get(url());
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toMatchObject({ current: 0, previous: 0, changeValue: 0 });
  });

  // The serializer would otherwise answer 500 with its own message, or write null as "".
  it.each([
    ['without a displayName', { avatar, contributionCount: 5, contributionPercentage: 10 }],
    ['with a null displayName', { displayName: null, avatar, contributionCount: 5 }],
    [
      'without an avatar',
      { displayName: 'octocat', contributionCount: 5, contributionPercentage: 10 },
    ],
    ['with a null avatar', { displayName: 'octocat', avatar: null, contributionCount: 5 }],
    ['with a string contributionCount', { displayName: 'octocat', avatar, contributionCount: '5' }],
    [
      'with a fractional contributionCount',
      { displayName: 'octocat', avatar, contributionCount: 5.5 },
    ],
    [
      'with a string contributionPercentage',
      { displayName: 'octocat', avatar, contributionPercentage: '10' },
    ],
  ])('maps a participant row %s to 503 upstream_unavailable', async (_, row) => {
    mockFetch.mockImplementation(routeTinybird({ leaderboard: [row] }));
    const res = await get(url());
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    expect(res.body).not.toContain('is required');
    expect(res.body).not.toContain('octocat');
  });
});
