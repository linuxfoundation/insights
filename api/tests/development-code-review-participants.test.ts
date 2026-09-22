// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  atDate,
  callsTo,
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

const activeContributorsPath = '/v0/pipes/active_contributors.json';
const leaderboardPath = '/v0/pipes/contributors_leaderboard.json';

const startDate = '2025-01-01';
const endDate = '2025-03-31';
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

interface PipeRows {
  bucket?: object[];
  current?: object[];
  previous?: object[];
  leaderboard?: object[];
}

const routeTinybird = ({
  bucket,
  current = [currentRow],
  previous = [previousRow],
  leaderboard = leaderboardRows,
}: PipeRows = {}) =>
  tinybirdStub((url) => {
    if (url.pathname === leaderboardPath) {
      return leaderboard;
    }
    return url.searchParams.get('startDate') === atMidnight(previousStart) ? previous : current;
  }, bucket);

const url = (params: Record<string, string | string[] | undefined> = {}, slug = 'kubernetes') =>
  `/v1-alpha/projects/${slug}/development/code-review-participants?${queryString({
    startDate,
    endDate,
    ...params,
  })}`;

const { get } = useApp();

beforeEach(() => {
  mockFetch.mockImplementation(routeTinybird());
});

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
  it('makes two active_contributors calls and one contributors_leaderboard call with the slug as project and the participant activity types', async () => {
    await get(url({ repos: [k8sRepo, websiteRepo] }));
    expect(callsTo(activeContributorsPath)).toHaveLength(2);
    expect(callsTo(leaderboardPath)).toHaveLength(1);
    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.origin).toBe(tinybirdHost);
      expect(call.searchParams.get('project')).toBe('kubernetes');
      expect(call.searchParams.get('activity_types')).toBe(participantActivityTypes);
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

  it('returns the same zeros for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(routeTinybird({ bucket: [] }));
    const res = await get(url({}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(zeroBody);
    vi.restoreAllMocks();
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

describe('request validation (AC7)', () => {
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
    await atDate('2025-09-21T12:00:00Z', async () => {
      const res = await get(url({ startDate: undefined, endDate: undefined }));
      expect(res.statusCode).toBe(200);
      expect(res.json().summary).toMatchObject({
        periodFrom: isoDay('2010-01-01'),
        periodTo: isoDay('2025-09-21'),
      });
      const leaderboard = callsTo(leaderboardPath)[0];
      expect(leaderboard?.searchParams.get('startDate')).toBe(atMidnight('2010-01-01'));
      expect(leaderboard?.searchParams.get('endDate')).toBe(atMidnight('2025-09-21'));
    });
  });
});

describe('OpenAPI (AC10)', () => {
  async function getOperation(): Promise<OpenApiOperation | undefined> {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    return res.json<OpenApiDoc>().paths[developmentPath('code-review-participants')]?.get;
  }

  it('documents the participant and summary counts as integers', async () => {
    const operation = await getOperation();
    const schema = operation?.responses['200']?.content['application/json']?.schema;
    expect(schema?.properties?.data?.items?.properties?.activityCount?.type).toBe('integer');
    expect(schema?.properties?.summary?.properties?.current?.type).toBe('integer');
  });

  it('documents the query params, with limit an integer from 1 to 50 defaulting to 5 and no granularity', async () => {
    const operation = await getOperation();
    const params = new Map(
      operation?.parameters
        ?.filter((param) => param.in === 'query')
        .map((param) => [param.name, param]),
    );
    expect([...params.keys()].sort()).toEqual(['endDate', 'limit', 'repos', 'startDate']);
    const limit = params.get('limit');
    expect(limit?.required).toBeFalsy();
    expect(limit?.schema).toMatchObject({ type: 'integer', default: 5, minimum: 1, maximum: 50 });
  });

  it('ends the description by marking the participant identity fields provisional', async () => {
    const operation = await getOperation();
    expect(
      operation?.description
        ?.trim()
        .endsWith('Participant identity fields are provisional in /v1-alpha.'),
    ).toBe(true);
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
