// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

const collectionExists = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/collections-db.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/lib/collections-db.js')>()),
  collectionExists,
}));

import { buildApp } from '../src/app.js';
import { UpstreamUnavailableError } from '../src/lib/errors.js';
import {
  bucketsPath,
  callsTo,
  collectionBucketsPath,
  collectionRoutePath,
  collectionStub,
  mockFetch,
  pipeCalls,
  projectPath,
  queryString,
  tinybirdError,
  tinybirdResponse,
  tinybirdStub,
  responseFields,
  useApp,
  type OpenApiDoc,
  type OpenApiSchema,
} from './helpers/tinybird.js';

// Cases the routes below a project share through fetchPipe, withBucket, the shared query schemas
// and the alpha plugin, then the same routes below a collection. Route files keep only what is
// specific to their route.
const discovery = await buildApp();
await discovery.ready();
const spec = (
  await discovery.inject({ method: 'GET', url: '/v1-alpha/openapi.json' })
).json<OpenApiDoc>();
await discovery.close();

// The trailing slash leaves out the project route itself, which has its own test file.
const prefix = projectPath('');
// Routes outside a project skip the slug, bucket, repos and date cases.
const globalPrefix = '/v1-alpha/';
const globalGroups = new Set(['leaderboards']);
const routes = Object.entries(spec.paths).flatMap(([path, item]) => {
  if (!item.get) {
    return [];
  }
  if (path.startsWith(prefix)) {
    return [{ name: path.slice(prefix.length), path, operation: item.get, scoped: true }];
  }
  const name = path.slice(globalPrefix.length);
  return path.startsWith(globalPrefix) && globalGroups.has(name.split('/')[0])
    ? [{ name, path, operation: item.get, scoped: false }]
    : [];
});
const names = routes.map((route) => route.name).sort();
const routeOf = (name: string) => routes.find((route) => route.name === name)!;
const operationOf = (name: string) => routeOf(name).operation;
const declares = (name: string, param: string) =>
  operationOf(name).parameters?.some((p) => p.name === param) ?? false;
const scoped = (name: string) => routeOf(name).scoped;
const hasDates = (name: string) => declares(name, 'startDate') || declares(name, 'endDate');

const groupTags: Record<string, string> = {
  development: 'Development',
  contributors: 'Contributors',
  popularity: 'Popularity',
  security: 'Security',
  overview: 'Overview',
  leaderboards: 'Leaderboards',
};
const tagOf = (name: string) =>
  scoped(name) && !name.includes('/') ? 'Projects' : groupTags[name.split('/')[0]];

const knownRequired = new Set(['slug', 'granularity', 'type']);
const validQuery = (name: string) => ({
  ...(hasDates(name) ? { startDate: '2025-01-01', endDate: '2025-03-31' } : {}),
  ...(declares(name, 'granularity') ? { granularity: 'monthly' } : {}),
});
const url = (name: string, params: Record<string, string | undefined> = {}, slug = 'kubernetes') =>
  `${routeOf(name).path.replace('{slug}', slug).replace('{type}', 'stars')}?${queryString({ ...validQuery(name), ...params })}`;

type QueryCase = [label: string, params: Record<string, string | undefined>];
const casesIf = (condition: boolean, cases: QueryCase[]) => (condition ? cases : []);
const malformedCursor = 'not-a-cursor';

// Rows with the columns of both leaderboard pipes, so a paginated route's row guard accepts them
// whichever of the two it pages. A route paging another pipe adds that pipe's columns here.
const rankedRows = (count: number) =>
  Array.from({ length: count }, (_, rank) => ({
    id: `id-${rank}`,
    slug: `organization-${rank}`,
    displayName: `Name ${rank}`,
    avatar: `https://avatars.test/${rank}.png`,
    logo: `https://logos.test/${rank}.png`,
    roles: [],
    githubHandleArray: [`handle-${rank}`],
    contributionCount: 100 - rank,
    contributionPercentage: 1,
  }));

// These pipes page by page number rather than limit and offset, so their own files test paging.
const pagesByNumber = new Set(['security/vulnerabilities', 'leaderboards/{type}']);

const { get } = useApp();
const emptyRows = tinybirdStub(() => []);

describe('route discovery', () => {
  it('finds the routes below a project and knows how to call each', () => {
    expect(names.length).toBeGreaterThanOrEqual(14);
    for (const name of names) {
      const required = operationOf(name)
        .parameters?.filter((param) => param.required)
        .map((param) => param.name);
      for (const param of required ?? []) {
        expect(knownRequired, `${name} requires ${param}; teach validQuery about it`).toContain(
          param,
        );
      }
    }
  });
});

describe.each(names)('%s', (name) => {
  it('answers 200 with Cache-Control: private, max-age=0', async () => {
    mockFetch.mockImplementation(emptyRows);
    const res = await get(url(name));
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('issues its pipe calls concurrently', async () => {
    mockFetch.mockImplementation(emptyRows);
    await get(url(name));
    const expected = pipeCalls().length;
    expect(expected).toBeGreaterThan(0);

    let inFlight = 0;
    let maxInFlight = 0;
    mockFetch.mockReset().mockImplementation(
      tinybirdStub(async () => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 5));
        inFlight -= 1;
        return [];
      }),
    );
    expect((await get(url(name))).statusCode).toBe(200);
    expect(maxInFlight).toBe(expected);
  });

  if (scoped(name)) {
    it('answers an unknown project after the bucket lookup alone', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockFetch.mockImplementation(tinybirdStub(() => [], []));
      const res = await get(url(name, {}, 'no-such-project'));
      expect(res.statusCode).toBe(200);
      expect(callsTo(bucketsPath)[0]?.searchParams.get('project')).toBe('no-such-project');
      expect(pipeCalls()).toHaveLength(0);
      vi.restoreAllMocks();
    });

    it('looks the bucket up once and forwards it, 0 included, on every pipe call', async () => {
      mockFetch.mockImplementation(tinybirdStub(() => [], [{ bucketId: 0 }]));
      expect((await get(url(name))).statusCode).toBe(200);
      expect(callsTo(bucketsPath)).toHaveLength(1);
      expect(callsTo(bucketsPath)[0]?.searchParams.get('project')).toBe('kubernetes');
      expect(pipeCalls().length).toBeGreaterThan(0);
      for (const call of pipeCalls()) {
        expect(call.searchParams.get('bucketId'), call.pathname).toBe('0');
      }
    });
  }

  describe('upstream failures answer 503 upstream_unavailable with the header set', () => {
    const cases: [string, () => void][] = [
      ...(scoped(name)
        ? ([
            ['a failing bucket lookup', () => mockFetch.mockResolvedValue(tinybirdError(500))],
            [
              'a bucket lookup network error',
              () => mockFetch.mockRejectedValue(new TypeError('fetch failed')),
            ],
          ] as [string, () => void][])
        : []),
      [
        'a pipe network error',
        () =>
          mockFetch.mockImplementation(
            tinybirdStub(() => {
              throw new TypeError('fetch failed: tinybird internal detail');
            }),
          ),
      ],
      [
        'a pipe body that is not JSON',
        () =>
          mockFetch.mockImplementation(
            tinybirdStub(
              () => new Response('<html>tinybird internal detail</html>', { status: 200 }),
            ),
          ),
      ],
      [
        'a pipe body whose data is not an array',
        () =>
          mockFetch.mockImplementation(
            tinybirdStub(
              () =>
                new Response(JSON.stringify({ data: 'tinybird internal detail' }), {
                  status: 200,
                }),
            ),
          ),
      ],
    ];

    it.each(cases)('%s', async (_label, arrange) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      arrange();
      const res = await get(url(name));
      expect(res.statusCode).toBe(503);
      expect(res.json().code).toBe('upstream_unavailable');
      expect(res.body).not.toContain('tinybird internal detail');
      expect(res.headers['cache-control']).toBe('private, max-age=0');
      vi.restoreAllMocks();
    });

    // The empty answer for an unknown project comes from the bucket lookup, so a pipe 404 is an
    // outage like any other status.
    it.each([500, 404, 401, 429])('a pipe %i, without echoing the status', async (status) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockImplementation(tinybirdStub(() => tinybirdError(status)));
      const res = await get(url(name));
      expect(res.statusCode).toBe(503);
      expect(res.json().code).toBe('upstream_unavailable');
      expect(res.body).not.toContain(String(status));
      expect(res.body).not.toContain('tinybird internal detail');
      expect(res.headers['cache-control']).toBe('private, max-age=0');
      vi.restoreAllMocks();
    });

    // Keyed by URL so the client's retries of the failing call fail too.
    it('answers 503 when any one pipe call fails and the rest succeed', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockImplementation(emptyRows);
      await get(url(name));
      const calls = [...new Set(pipeCalls().map((call) => `${call.pathname}${call.search}`))];
      expect(calls.length).toBeGreaterThan(0);
      for (const failing of calls) {
        mockFetch
          .mockReset()
          .mockImplementation(
            tinybirdStub((call) =>
              `${call.pathname}${call.search}` === failing ? tinybirdError(500) : [],
            ),
          );
        expect((await get(url(name))).statusCode, failing).toBe(503);
      }
      vi.restoreAllMocks();
    });

    it.runIf(scoped(name))('calls no pipe when the bucket lookup fails', async () => {
      mockFetch.mockImplementation(async (input: unknown) =>
        new URL(String(input)).pathname === bucketsPath ? tinybirdError(500) : tinybirdResponse([]),
      );
      expect((await get(url(name))).statusCode).toBe(503);
      expect(pipeCalls()).toHaveLength(0);
    });
  });

  if (declares(name, 'repos')) {
    describe('repos', () => {
      const repo = 'https://github.com/kubernetes/kubernetes';
      const other = 'https://github.com/kubernetes/website';
      const reposOnEveryCall = async (query: string) => {
        mockFetch.mockReset().mockImplementation(emptyRows);
        expect((await get(`${url(name)}&${query}`)).statusCode).toBe(200);
        expect(pipeCalls().length).toBeGreaterThan(0);
        return pipeCalls().map((call) => call.searchParams.get('repos'));
      };

      it('sends every repos value on every pipe call', async () => {
        const sent = await reposOnEveryCall(queryString({ repos: [repo, other] }));
        expect(new Set(sent)).toEqual(new Set([`${repo},${other}`]));
      });

      it('drops an empty repos value and keeps the rest', async () => {
        expect(new Set(await reposOnEveryCall('repos='))).toEqual(new Set([null]));
        const sent = await reposOnEveryCall(queryString({ repos: ['', repo] }));
        expect(new Set(sent)).toEqual(new Set([repo]));
      });

      it('sends no repos when the caller sends none', async () => {
        expect(new Set(await reposOnEveryCall(''))).toEqual(new Set([null]));
      });
    });
  }

  const badQueries = [
    ...casesIf(hasDates(name), [
      ['a timestamp in startDate', { startDate: '2025-01-01T00:00:00Z' }],
      ['an endDate that is not a date', { endDate: 'yesterday' }],
      ['an inverted range', { startDate: '2025-03-31', endDate: '2025-01-01' }],
      ['a startDate before 2000-01-01', { startDate: '1999-12-31' }],
      ['an endDate after today', { endDate: '2999-01-01' }],
    ]),
    ...casesIf(declares(name, 'granularity'), [
      ['a missing granularity', { granularity: undefined }],
      ['granularity=hourly', { granularity: 'hourly' }],
    ]),
    ...casesIf(declares(name, 'cursor'), [
      ['pageSize=0', { pageSize: '0' }],
      ['pageSize=201', { pageSize: '201' }],
      ['a pageSize that is not an integer', { pageSize: '2.5' }],
      ['a malformed cursor', { cursor: malformedCursor }],
    ]),
  ];

  // vitest fails a describe block that holds no test.
  if (badQueries.length > 0) {
    describe('rejects a bad query with 400 before calling Tinybird', () => {
      it.each(badQueries)('%s', async (_label, params) => {
        const res = await get(url(name, params));
        expect(res.statusCode).toBe(400);
        expect(mockFetch).not.toHaveBeenCalled();
      });

      if (hasDates(name)) {
        it('answers an inverted range with code invalid_request', async () => {
          const res = await get(url(name, { startDate: '2025-03-31', endDate: '2025-01-01' }));
          expect(res.json().code).toBe('invalid_request');
        });
      }

      if (declares(name, 'cursor')) {
        it('answers a malformed cursor with code invalid_request', async () => {
          const res = await get(url(name, { cursor: malformedCursor }));
          expect(res.json().code).toBe('invalid_request');
        });
      }
    });
  }

  if (declares(name, 'cursor') && !pagesByNumber.has(name)) {
    describe('pagination', () => {
      const pagedCalls = () =>
        pipeCalls()
          .filter((call) => call.searchParams.has('offset'))
          .map((call) => [call.searchParams.get('limit'), call.searchParams.get('offset')]);
      const getPage = async (params: Record<string, string> = {}) => {
        const res = await get(url(name, params));
        expect(res.statusCode).toBe(200);
        return res.json<{ data: unknown[]; pageSize: number; nextCursor: string | null }>();
      };

      it('asks the pipe for 51 rows from offset 0 by default', async () => {
        mockFetch.mockImplementation(emptyRows);
        expect(await getPage()).toMatchObject({ data: [], pageSize: 50, nextCursor: null });
        expect(pagedCalls()).toEqual([['51', '0']]);
      });

      it('answers nextCursor null when the pipe returns at most pageSize rows', async () => {
        mockFetch.mockImplementation(tinybirdStub(() => rankedRows(2)));
        const page = await getPage({ pageSize: '2' });
        expect(page.data).toHaveLength(2);
        expect(page.nextCursor).toBeNull();
        expect(pagedCalls()).toEqual([['3', '0']]);
      });

      it('drops the extra row of pageSize + 1 and follows nextCursor to the next offset', async () => {
        mockFetch.mockImplementation(tinybirdStub(() => rankedRows(2)));
        const exact = await getPage({ pageSize: '2' });
        mockFetch.mockReset().mockImplementation(tinybirdStub(() => rankedRows(3)));
        const first = await getPage({ pageSize: '2' });
        expect(first.data).toEqual(exact.data);
        expect(first.pageSize).toBe(2);
        expect(first.nextCursor).toEqual(expect.any(String));

        mockFetch.mockClear();
        await getPage({ pageSize: '2', cursor: first.nextCursor! });
        expect(pagedCalls()).toEqual([['3', '2']]);
      });
    });
  }

  describe('OpenAPI', () => {
    it(`is tagged ${tagOf(name)}, with a summary and a description`, () => {
      const operation = operationOf(name);
      expect(tagOf(name), `add the tag of ${name.split('/')[0]} to groupTags`).toBeDefined();
      expect(operation.tags).toEqual([tagOf(name)]);
      expect(operation.summary).toBeTruthy();
      expect(operation.description).toBeTruthy();
    });

    if (hasDates(name)) {
      it('publishes startDate and endDate as optional calendar days', () => {
        for (const param of ['startDate', 'endDate']) {
          const found = operationOf(name).parameters?.find((p) => p.name === param);
          expect(found?.required, param).toBeFalsy();
          expect(found?.schema, param).toMatchObject({ type: 'string', format: 'date' });
        }
      });
    }

    it('requires every response field', () => {
      const schema = operationOf(name).responses['200']?.content['application/json']?.schema;
      const fields = responseFields(spec, schema);
      expect(fields.length).toBeGreaterThan(0);
      expect(fields.filter((field) => !field.required).map((field) => field.path)).toEqual([]);
    });

    it('stays out of /v1', async () => {
      const v1 = (await get('/v1/openapi.json')).json<OpenApiDoc>();
      expect(Object.keys(v1.paths)).not.toContain(routeOf(name).path.replace('/v1-alpha/', '/v1/'));
      const res = await get(url(name).replace('/v1-alpha/', '/v1/'));
      expect(res.statusCode).toBe(404);
    });
  });
});

// The collection variant of every route that registers one, through the widget-scope helper.
const collectionPrefix = collectionRoutePath('');
const collectionRoutes = Object.entries(spec.paths).flatMap(([path, item]) =>
  item.get && path.startsWith(collectionPrefix)
    ? [{ name: path.slice(collectionPrefix.length), path, operation: item.get }]
    : [],
);
const collectionNames = collectionRoutes.map((route) => route.name).sort();
const collectionOf = (name: string) => collectionRoutes.find((route) => route.name === name)!;
const collectionDeclares = (name: string, param: string) =>
  collectionOf(name).operation.parameters?.some((p) => p.name === param) ?? false;
const collectionUrl = (
  name: string,
  params: Record<string, string | undefined> = {},
  slug = 'cncf',
) =>
  `${collectionOf(name).path.replace('{slug}', slug)}?${queryString({ ...validQuery(name), ...params })}`;
const collectionGroups = ['contributors'];
const collectionExcluded = new Set<string>();
const emptyCollection = collectionStub(() => []);
// The module mock answers for the CM database: only these collections are public.
const publicCollections = new Set(['cncf']);

describe('collection scope discovery', () => {
  it('registers a collection variant only for routes that have a project route', () => {
    expect(collectionNames.length).toBeGreaterThan(0);
    for (const name of collectionNames) {
      expect(names, `${name} has no project route to share its handler with`).toContain(name);
    }
  });

  // A route left project-only must be listed in `collectionExcluded` with its reason.
  it.each(collectionGroups)(
    'registers a collection variant for every %s project route',
    (group) => {
      const inGroup = (name: string) => name.startsWith(`${group}/`);
      expect(collectionNames.filter(inGroup)).toEqual(
        names.filter((name) => inGroup(name) && !collectionExcluded.has(name)),
      );
    },
  );
});

describe.each(collectionNames)('collection scope: %s', (name) => {
  beforeEach(() => {
    collectionExists.mockReset();
    collectionExists.mockImplementation(async (_request, slug: string) =>
      publicCollections.has(slug),
    );
  });

  it('answers 200 with Cache-Control: private, max-age=0', async () => {
    mockFetch.mockImplementation(emptyCollection);
    const res = await get(collectionUrl(name));
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('issues its pipe calls concurrently', async () => {
    mockFetch.mockImplementation(emptyCollection);
    await get(collectionUrl(name));
    const expected = pipeCalls().length;
    expect(expected).toBeGreaterThan(0);

    let inFlight = 0;
    let maxInFlight = 0;
    mockFetch.mockReset().mockImplementation(
      collectionStub(async () => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 5));
        inFlight -= 1;
        return [];
      }),
    );
    expect((await get(collectionUrl(name))).statusCode).toBe(200);
    expect(maxInFlight).toBe(expected);
  });

  it.each(['no-such-collection', 'private-one'])(
    'answers 404 for %s without calling Tinybird',
    async (slug) => {
      mockFetch.mockImplementation(emptyCollection);
      const res = await get(collectionUrl(name, {}, slug));
      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({ code: 'not_found', message: 'Collection not found' });
      expect(res.headers['cache-control']).toBe('private, max-age=0');
      expect(collectionExists.mock.calls[0]?.[1]).toBe(slug);
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );

  it('sends collectionSlug on every pipe call, and neither a project nor a project bucket lookup', async () => {
    mockFetch.mockImplementation(collectionStub(() => [], [{ bucketId: 0 }]));
    expect((await get(collectionUrl(name))).statusCode).toBe(200);
    expect(pipeCalls().length).toBeGreaterThan(0);
    for (const call of pipeCalls()) {
      expect(call.searchParams.get('collectionSlug'), call.pathname).toBe('cncf');
      expect(call.searchParams.has('project'), call.pathname).toBe(false);
    }
    expect(callsTo(bucketsPath)).toHaveLength(0);
  });

  it('routes through the collection bucket the Tinybird client resolves', async () => {
    mockFetch.mockImplementation(collectionStub(() => [], [{ bucketId: 4 }]));
    await get(collectionUrl(name));
    expect(callsTo(collectionBucketsPath)).toHaveLength(1);
    expect(callsTo(collectionBucketsPath)[0]?.searchParams.get('collectionSlug')).toBe('cncf');
    for (const call of pipeCalls()) {
      expect(call.searchParams.get('bucketId'), call.pathname).toBe('4');
    }
  });

  it('still answers when the collection has no bucket', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(collectionStub(() => [], []));
    expect((await get(collectionUrl(name))).statusCode).toBe(200);
    for (const call of pipeCalls()) {
      expect(call.searchParams.has('bucketId'), call.pathname).toBe(false);
    }
    vi.restoreAllMocks();
  });

  describe('upstream failures answer 503 upstream_unavailable with the header set', () => {
    const cases: [string, () => void][] = [
      [
        'a pipe network error',
        () =>
          mockFetch.mockImplementation(
            collectionStub(() => {
              throw new TypeError('fetch failed: tinybird internal detail');
            }),
          ),
      ],
      [
        'a pipe body that is not JSON',
        () =>
          mockFetch.mockImplementation(
            collectionStub(
              () => new Response('<html>tinybird internal detail</html>', { status: 200 }),
            ),
          ),
      ],
      [
        'a collection lookup failure',
        () => collectionExists.mockRejectedValue(new UpstreamUnavailableError()),
      ],
    ];

    it.each(cases)('%s', async (_label, arrange) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockFetch.mockImplementation(emptyCollection);
      arrange();
      const res = await get(collectionUrl(name));
      expect(res.statusCode).toBe(503);
      expect(res.json().code).toBe('upstream_unavailable');
      expect(res.body).not.toContain('tinybird internal detail');
      expect(res.headers['cache-control']).toBe('private, max-age=0');
      vi.restoreAllMocks();
    });

    it.each([500, 404, 401, 429])('a pipe %i, without echoing the status', async (status) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockImplementation(collectionStub(() => tinybirdError(status)));
      const res = await get(collectionUrl(name));
      expect(res.statusCode).toBe(503);
      expect(res.json().code).toBe('upstream_unavailable');
      expect(res.body).not.toContain(String(status));
      expect(res.headers['cache-control']).toBe('private, max-age=0');
      vi.restoreAllMocks();
    });

    it('calls no pipe when the collection lookup fails', async () => {
      collectionExists.mockRejectedValue(new UpstreamUnavailableError());
      expect((await get(collectionUrl(name))).statusCode).toBe(503);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('repos', () => {
    it('is left out of the published parameters', () => {
      expect(collectionDeclares(name, 'repos')).toBe(false);
    });

    it('is ignored when a caller sends it anyway', async () => {
      mockFetch.mockImplementation(emptyCollection);
      const repo = queryString({ repos: ['https://github.com/kubernetes/kubernetes'] });
      expect((await get(`${collectionUrl(name)}&${repo}`)).statusCode).toBe(200);
      for (const call of pipeCalls()) {
        expect(call.searchParams.has('repos'), call.pathname).toBe(false);
      }
    });
  });

  it('rejects a bad query with 400 before the collection lookup or Tinybird', async () => {
    const bad = collectionDeclares(name, 'granularity')
      ? { granularity: 'hourly' }
      : { startDate: '2025-01-01T00:00:00Z' };
    const res = await get(collectionUrl(name, bad));
    expect(res.statusCode).toBe(400);
    expect(collectionExists).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  describe('OpenAPI', () => {
    const operation = () => collectionOf(name).operation;

    it('is tagged Collections, with a summary and a description', () => {
      expect(operation().tags).toEqual(['Collections']);
      expect(operation().summary).toBeTruthy();
      expect(operation().description).toBeTruthy();
    });

    it('requires the slug and documents the 404', () => {
      const slug = operation().parameters?.find((param) => param.name === 'slug');
      expect(slug?.required).toBe(true);
      expect(operation().description).toContain('unknown or private collection');
    });

    it('reads as a collection, with no project wording left over', () => {
      const text = JSON.stringify([
        operation().description,
        operation().parameters,
        operation().responses,
      ]);
      expect(text).not.toMatch(/unknown project|the project|project's|project repository|`repos`/);
    });

    it('requires every response field', () => {
      const schema = operation().responses['200']?.content['application/json']?.schema;
      const fields = responseFields(spec, schema);
      expect(fields.length).toBeGreaterThan(0);
      expect(fields.filter((field) => !field.required).map((field) => field.path)).toEqual([]);
    });

    it('stays out of /v1', async () => {
      const v1 = (await get('/v1/openapi.json')).json<OpenApiDoc>();
      const v1Path = collectionOf(name).path.replace('/v1-alpha/', '/v1/');
      expect(Object.keys(v1.paths)).not.toContain(v1Path);
      expect((await get(collectionUrl(name).replace('/v1-alpha/', '/v1/'))).statusCode).toBe(404);
    });
  });
});

describe('responseFields', () => {
  const doc: OpenApiDoc = {
    paths: {},
    components: {
      schemas: {
        Buckets: {
          type: 'array',
          items: {
            type: 'object',
            required: ['day'],
            properties: { day: { type: 'string' }, note: { type: 'string' } },
          },
        },
      },
    },
  };
  const optional = (schema: OpenApiSchema) =>
    responseFields(doc, schema)
      .filter((field) => !field.required)
      .map((field) => field.path);

  it('walks the items of an array behind a $ref', () => {
    const schema = {
      required: ['data'],
      properties: { data: { $ref: '#/components/schemas/Buckets' } },
    };
    expect(optional(schema)).toEqual(['data[].note']);
  });

  it('flags a property its parent does not require, at any depth', () => {
    const schema = {
      properties: {
        summary: { description: 'x', properties: { current: { description: 'y' } } },
      },
    };
    expect(optional(schema)).toEqual(['summary', 'summary.current']);
  });
});
