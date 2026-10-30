// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

const findCollectionMembers = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/collections-db.js', () => ({ findCollectionMembers }));

import { UpstreamUnavailableError } from '../src/lib/errors.js';
import {
  mockFetch,
  pipeCalls,
  postedParams,
  queryString,
  tinybirdResponse,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
} from './helpers/tinybird.js';

const route = '/v1-alpha/collections/cncf/projects';
const pipePath = '/v0/pipes/project_repo_insights.json';
const cursorFor = (offset: number) => Buffer.from(String(offset)).toString('base64url');

const row = (index: number, type: 'project' | 'repo' = 'project') => ({
  id: `id-${index}`,
  type,
  repoUrl: type === 'repo' ? `https://github.com/org/repo-${index}` : '',
  name: `Item ${index}`,
  slug: `item-${index}`,
  logoUrl: '',
  isLF: 1,
  status: 'active',
  contributorCount: 100 - index,
  organizationCount: 10,
  softwareValue: 1000,
  contributorDependencyCount: 3,
  contributorDependencyPercentage: 51,
  organizationDependencyCount: 1,
  organizationDependencyPercentage: 60,
  achievements: [['forks', 12, 10970]],
  healthScoreV2: 77,
  healthLabel: 'healthy',
  healthMaxScore: 100,
  maintainerHealthScoreV2: 40,
  securitySupplyChainScoreV2: 16,
  developmentActivityScoreV2: 21,
  lifecycleLabel: 'active',
  impactScore: 5,
  impactLabel: 'minor',
});

const members = {
  id: 'c1',
  projectIds: ['p1', 'p2'],
  repositoryUrls: ['https://github.com/org/r1'],
};

// The pipe pages by row: `limit` rows from `offset`.
let all: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  findCollectionMembers.mockReset().mockResolvedValue(members);
  all = Array.from({ length: 5 }, (_, index) => row(index + 1));
  mockFetch.mockImplementation(
    tinybirdStub((url, init) => {
      if (url.pathname !== pipePath) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      const form = new URLSearchParams(String(init?.body ?? ''));
      const start = Number(form.get('offset'));
      return all.slice(start, start + Number(form.get('limit')));
    }),
  );
});

interface Body {
  data: { id: string; isLF: boolean; achievements: unknown[] }[];
  pageSize: number;
  nextCursor: string | null;
}

const bodyOf = async (params: Record<string, string> = {}) => {
  const res = await get(`${route}?${queryString(params)}`);
  expect(res.statusCode).toBe(200);
  return res.json<Body>();
};
const ids = (body: Body) => body.data.map((item) => item.id);
const pipeParams = () => postedParams(pipePath)[0]!;

describe('collection lookup', () => {
  it('looks the collection up by slug', async () => {
    await bodyOf();
    expect(findCollectionMembers.mock.calls[0]![1]).toBe('cncf');
  });

  it('answers 404 for an unknown or private slug without calling Tinybird', async () => {
    findCollectionMembers.mockResolvedValue(null);
    const res = await get(route);
    expect(res.statusCode).toBe(404);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('answers 503 when the database is unavailable', async () => {
    findCollectionMembers.mockRejectedValue(new UpstreamUnavailableError());
    const res = await get(route);
    expect(res.statusCode).toBe(503);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns an empty page without calling Tinybird when the collection has no members', async () => {
    findCollectionMembers.mockResolvedValue({ id: 'c1', projectIds: [], repositoryUrls: [] });
    expect(await bodyOf({ pageSize: '7' })).toEqual({ data: [], pageSize: 7, nextCursor: null });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('Tinybird call', () => {
  it('posts the params in the body and keeps the URL free of a query string', async () => {
    await bodyOf();
    const [url, init] = mockFetch.mock.calls.find(
      (call) => new URL(String(call[0])).pathname === pipePath,
    )!;
    expect((init as RequestInit).method).toBe('POST');
    expect(new URL(String(url)).search).toBe('');
  });

  it('sends the members, default sort, and one row more than the default pageSize from offset 0', async () => {
    await bodyOf();
    expect(pipeCalls()).toHaveLength(1);
    const params = pipeParams();
    expect(params.get('ids')).toBe('p1,p2');
    expect(params.get('repoUrls')).toBe('https://github.com/org/r1');
    expect(params.get('orderByField')).toBe('contributorCount');
    expect(params.get('orderByDirection')).toBe('desc');
    expect(params.get('limit')).toBe('51');
    expect(params.get('offset')).toBe('0');
    expect(params.has('page')).toBe(false);
    expect(params.has('pageSize')).toBe(false);
    expect(params.has('isLfx')).toBe(false);
  });

  it('splits sort on the last underscore', async () => {
    await bodyOf({ sort: 'name_asc' });
    expect(pipeParams().get('orderByField')).toBe('name');
    expect(pipeParams().get('orderByDirection')).toBe('asc');
  });

  it.each(['bogus', 'name', 'name_up', 'healthScore_desc'])(
    'answers 400 for sort %s before calling Tinybird',
    async (sort) => {
      const res = await get(`${route}?${queryString({ sort })}`);
      expect(res.statusCode).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['true', '1'],
    ['false', '0'],
  ])('maps isLF=%s to isLfx=%s', async (isLF, isLfx) => {
    await bodyOf({ isLF });
    expect(pipeParams().get('isLfx')).toBe(isLfx);
  });

  it('answers 400 for a non-boolean isLF', async () => {
    const res = await get(`${route}?isLF=maybe`);
    expect(res.statusCode).toBe(400);
  });

  it('omits the empty list when the collection has only projects', async () => {
    findCollectionMembers.mockResolvedValue({ id: 'c1', projectIds: ['p1'], repositoryUrls: [] });
    await bodyOf();
    expect(pipeParams().get('ids')).toBe('p1');
    expect(pipeParams().has('repoUrls')).toBe(false);
  });
});

describe('type filter', () => {
  it('sends only the project ids for type=project', async () => {
    await bodyOf({ type: 'project' });
    expect(pipeParams().get('ids')).toBe('p1,p2');
    expect(pipeParams().has('repoUrls')).toBe(false);
  });

  it('sends only the repository urls for type=repo', async () => {
    await bodyOf({ type: 'repo' });
    expect(pipeParams().has('ids')).toBe(false);
    expect(pipeParams().get('repoUrls')).toBe('https://github.com/org/r1');
  });

  it('returns an empty page without calling Tinybird when the type has no members', async () => {
    findCollectionMembers.mockResolvedValue({ id: 'c1', projectIds: ['p1'], repositoryUrls: [] });
    expect(await bodyOf({ type: 'repo' })).toEqual({ data: [], pageSize: 50, nextCursor: null });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('answers 400 for an unknown type', async () => {
    const res = await get(`${route}?type=group`);
    expect(res.statusCode).toBe(400);
  });
});

describe('response', () => {
  it('maps rows to the CollectionProject schema', async () => {
    const body = await bodyOf({ pageSize: '2' });
    expect(body.data[0]).toMatchObject({
      id: 'id-1',
      type: 'project',
      repoUrl: null,
      logoUrl: null,
      isLF: true,
      healthScore: 77,
      achievements: [{ leaderboardType: 'forks', rank: 12, totalCount: 10970 }],
    });
    expect(body.data[0]).not.toHaveProperty('healthScoreV2');
  });

  it.each([
    ['a score with a null label', { healthScoreV2: 77, healthLabel: null }],
    [
      'a label with a null score',
      { healthScoreV2: null, healthLabel: 'healthy', healthMaxScore: null },
    ],
    [
      'a maximum with a null score',
      { healthScoreV2: null, healthLabel: null, healthMaxScore: 100 },
    ],
  ])('answers 503 for %s', async (_label, patch) => {
    all = [{ ...row(1), ...patch }];
    const res = await get(route);
    expect(res.statusCode).toBe(503);
  });

  it('accepts a repo row with a score and no maximum', async () => {
    all = [{ ...row(1, 'repo'), healthScoreV2: 61, healthLabel: 'fair', healthMaxScore: null }];
    const body = await bodyOf();
    expect(body.data[0]).toMatchObject({
      type: 'repo',
      healthScore: 61,
      healthLabel: 'fair',
      healthMaxScore: null,
    });
  });

  it('answers 503 for rows of an unexpected shape', async () => {
    mockFetch.mockImplementation(async () => tinybirdResponse([{ id: 'x' }]));
    const res = await get(route);
    expect(res.statusCode).toBe(503);
  });
});

describe('paging', () => {
  it('gives a cursor when more rows follow and none on the last page', async () => {
    const first = await bodyOf({ pageSize: '2' });
    expect(ids(first)).toEqual(['id-1', 'id-2']);
    expect(first.pageSize).toBe(2);
    expect(first.nextCursor).toBe(cursorFor(2));

    const last = await bodyOf({ pageSize: '2', cursor: cursorFor(4) });
    expect(ids(last)).toEqual(['id-5']);
    expect(last.nextCursor).toBeNull();
  });

  it('keeps its position when pageSize changes between pages', async () => {
    const body = await bodyOf({ pageSize: '2', cursor: cursorFor(3) });
    expect(ids(body)).toEqual(['id-4', 'id-5']);
    const windows = postedParams(pipePath).map((form) => [form.get('limit'), form.get('offset')]);
    expect(windows).toEqual([['3', '3']]);
    expect(body.nextCursor).toBeNull();
  });

  it('answers nextCursor null when the page ends on the last row', async () => {
    all = all.slice(0, 4);
    const body = await bodyOf({ pageSize: '2', cursor: cursorFor(2) });
    expect(ids(body)).toEqual(['id-3', 'id-4']);
    expect(body.nextCursor).toBeNull();
  });

  it('answers 400 for a cursor that is not a nextCursor value', async () => {
    const res = await get(`${route}?cursor=%21%21`);
    expect(res.statusCode).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('OpenAPI', () => {
  it('tags the route as Collections and gives it a summary', async () => {
    const res = await get('/v1-alpha/openapi.json');
    expect(res.statusCode).toBe(200);
    const operation = res.json<OpenApiDoc>().paths['/v1-alpha/collections/{slug}/projects']?.get;
    expect(operation?.tags).toEqual(['Collections']);
    expect(operation?.summary).toEqual(expect.any(String));
    expect(operation?.summary).not.toBe('');
  });
});
