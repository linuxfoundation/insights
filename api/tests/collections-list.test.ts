// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ listCollections: vi.fn() }));

vi.mock('../src/lib/collections-db.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/lib/collections-db.js')>()),
  listCollections: db.listCollections,
}));

import { buildApp } from '../src/app.js';
import type { CollectionRow } from '../src/lib/collections.js';
import { UpstreamUnavailableError } from '../src/lib/errors.js';
import { requestedPage } from '../src/lib/pagination.js';

const route = '/v1-alpha/collections';
const categoryA = '0b6f3a4e-9c1d-4f2a-8e3b-5d7c9a1b2c3d';
const categoryB = '7e8ad4c2-0c87-4c8b-ab40-fdd33ca4b21a';

const row = (n: number, overrides: Partial<CollectionRow> = {}): CollectionRow => ({
  id: `0b6f3a4e-9c1d-4f2a-8e3b-5d7c9a1b2c${String(n).padStart(2, '0')}`,
  name: `Collection ${n}`,
  slug: `collection-${n}`,
  description: null,
  ssoUserId: null,
  logoUrl: null,
  imageUrl: null,
  color: null,
  createdAt: new Date('2025-01-02T03:04:05Z'),
  updatedAt: new Date('2025-06-07T08:09:10Z'),
  ownerName: null,
  ownerLogo: null,
  projectCount: 2,
  repositoryCount: 1,
  likeCount: 7,
  featuredProjects: [],
  ...overrides,
});

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  db.listCollections.mockReset();
  db.listCollections.mockResolvedValue([]);
});

const get = (query = '') => app.inject({ method: 'GET', url: `${route}${query}` });
const lastQuery = () => db.listCollections.mock.calls.at(-1)?.[1];

describe('response (AC1)', () => {
  it('maps rows to collections inside the page envelope', async () => {
    db.listCollections.mockResolvedValue([
      row(1),
      row(2, { ssoUserId: 'sso-1', ownerName: 'Ada' }),
    ]);

    const res = await get();

    expect(res.statusCode).toBe(200);
    const body = res.json<{
      data: Record<string, unknown>[];
      pageSize: number;
      nextCursor: null;
    }>();
    expect(body.pageSize).toBe(50);
    expect(body.nextCursor).toBeNull();
    expect(body.data.map((c) => [c.slug, c.type])).toEqual([
      ['collection-1', 'curated'],
      ['collection-2', 'community'],
    ]);
    expect(body.data[1]?.owner).toEqual({ name: 'Ada', logoUrl: null });
  });

  it('lists the route under the Collections tag and names the skipped highlighting', async () => {
    const spec = app.swagger() as {
      paths: Record<string, { get: { tags: string[]; description: string } }>;
    };
    const operation = spec.paths[route]?.get;
    expect(operation?.tags).toEqual(['Collections']);
    expect(operation?.description).toMatch(/highlight|pin/i);
  });
});

describe('filters (AC2-AC4)', () => {
  it('passes no filters by default', async () => {
    await get();
    expect(lastQuery()).toMatchObject({
      search: undefined,
      categoryIds: undefined,
      type: undefined,
    });
  });

  it('passes search through', async () => {
    await get('?search=Cloud%20Native');
    expect(lastQuery().search).toBe('Cloud Native');
  });

  it('splits categories on commas', async () => {
    await get(`?categories=${categoryA},${categoryB}`);
    expect(lastQuery().categoryIds).toEqual([categoryA, categoryB]);
  });

  it.each(['curated', 'community'])('passes type=%s', async (type) => {
    await get(`?type=${type}`);
    expect(lastQuery().type).toBe(type);
  });

  it.each(['?type=private', '?categories=nope', `?categories=${categoryA},nope`])(
    'answers 400 for %s before reading the database',
    async (query) => {
      const res = await get(query);
      expect(res.statusCode).toBe(400);
      expect(db.listCollections).not.toHaveBeenCalled();
    },
  );
});

describe('sort (AC5)', () => {
  it('defaults to name ascending', async () => {
    await get();
    expect(lastQuery().sort).toEqual({ field: 'name', direction: 'asc' });
  });

  it.each([
    ['name_desc', 'name', 'desc'],
    ['createdAt_asc', 'createdAt', 'asc'],
    ['createdAt_desc', 'createdAt', 'desc'],
    ['projectCount_desc', 'projectCount', 'desc'],
    ['likeCount_asc', 'likeCount', 'asc'],
    ['starred_asc', 'starred', 'asc'],
    ['starred_desc', 'starred', 'desc'],
  ])('maps %s', async (sort, field, direction) => {
    await get(`?sort=${sort}`);
    expect(lastQuery().sort).toEqual({ field, direction });
  });

  it.each(['name', 'popularity_asc', 'name_up'])('answers 400 for sort=%s', async (sort) => {
    const res = await get(`?sort=${sort}`);
    expect(res.statusCode).toBe(400);
    expect(db.listCollections).not.toHaveBeenCalled();
  });
});

describe('paging (AC6)', () => {
  it('reads one row beyond the page to detect a next page', async () => {
    await get('?pageSize=2');
    expect(lastQuery()).toMatchObject({ limit: 3, offset: 0 });
  });

  it('returns a cursor that resumes after the page', async () => {
    db.listCollections.mockResolvedValue([row(1), row(2), row(3)]);

    const first = (await get('?pageSize=2')).json<{ data: unknown[]; nextCursor: string }>();
    expect(first.data).toHaveLength(2);
    expect(requestedPage({ cursor: first.nextCursor, pageSize: 2 }).offset).toBe(2);

    db.listCollections.mockResolvedValue([row(3)]);
    const second = (await get(`?pageSize=2&cursor=${first.nextCursor}`)).json<{
      data: unknown[];
      nextCursor: string | null;
    }>();
    expect(lastQuery()).toMatchObject({ limit: 3, offset: 2 });
    expect(second.data).toHaveLength(1);
    expect(second.nextCursor).toBeNull();
  });

  it('answers 400 for a foreign cursor', async () => {
    const res = await get('?cursor=not-a-cursor!');
    expect(res.statusCode).toBe(400);
    expect(db.listCollections).not.toHaveBeenCalled();
  });

  it.each(['0', '201'])('answers 400 for pageSize=%s', async (size) => {
    expect((await get(`?pageSize=${size}`)).statusCode).toBe(400);
  });
});

describe('upstream failure (AC8)', () => {
  it('answers 503 when the CM database is unavailable', async () => {
    db.listCollections.mockRejectedValue(new UpstreamUnavailableError());
    expect((await get()).statusCode).toBe(503);
  });
});
