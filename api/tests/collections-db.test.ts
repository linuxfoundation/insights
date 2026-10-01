// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryCm = vi.hoisted(() => vi.fn());
vi.mock('../src/clients/postgres.js', () => ({ queryCm }));

import {
  collectionExists,
  findCollection,
  findCollectionMembers,
  listCollections,
  type CollectionQuery,
} from '../src/lib/collections-db.js';

const log = { log: { error: vi.fn() } } as never;
const visible = `c."deletedAt" IS NULL AND c."isPrivate" = false`;
const sql = () => String(queryCm.mock.calls[0]![1]);
const params = () => queryCm.mock.calls[0]![2] as unknown[];
const normalized = () => sql().replace(/\s+/g, ' ');

const baseQuery: CollectionQuery = {
  sort: { field: 'name', direction: 'asc' },
  limit: 11,
  offset: 0,
};

beforeEach(() => {
  queryCm.mockReset();
  queryCm.mockResolvedValue([]);
});

describe('listCollections', () => {
  it('reads only public collections and pages with bind parameters', async () => {
    await listCollections(log, { ...baseQuery, offset: 20 });

    expect(sql()).toContain(visible);
    expect(normalized()).toContain('ORDER BY c.name ASC, c.id ASC LIMIT $1 OFFSET $2');
    expect(params()).toEqual([11, 20]);
  });

  it('binds the filters and escapes LIKE wildcards in the search', async () => {
    await listCollections(log, {
      ...baseQuery,
      search: '50%_off\\',
      categoryIds: ['a', 'b'],
      type: 'community',
    });

    expect(normalized()).toContain('c.name ILIKE $1');
    expect(normalized()).toContain('c."categoryId" = ANY($2)');
    expect(sql()).toContain('c."ssoUserId" IS NOT NULL');
    expect(params()).toEqual(['%50\\%\\_off\\\\%', ['a', 'b'], 11, 0]);
  });

  it('filters curated collections on a null owner', async () => {
    await listCollections(log, { ...baseQuery, type: 'curated' });

    expect(sql()).toContain('c."ssoUserId" IS NULL');
  });

  it.each([
    [{ field: 'createdAt', direction: 'desc' }, 'c."createdAt" DESC, c.id ASC'],
    [{ field: 'likeCount', direction: 'desc' }, '"likeCount" DESC, c.id ASC'],
    [{ field: 'projectCount', direction: 'asc' }, '"projectCount" ASC, c.id ASC'],
    [{ field: 'starred', direction: 'asc' }, 'c.starred DESC, c.name ASC, c.id ASC'],
    [{ field: 'starred', direction: 'desc' }, 'c.starred DESC, c.name ASC, c.id ASC'],
  ] as const)('orders by %j', async (sort, order) => {
    await listCollections(log, { ...baseQuery, sort });

    expect(normalized()).toContain(`ORDER BY ${order}`);
  });

  it('returns the rows of the query', async () => {
    queryCm.mockResolvedValue([{ id: 'a' }]);

    await expect(listCollections(log, baseQuery)).resolves.toEqual([{ id: 'a' }]);
  });
});

describe('findCollection', () => {
  it('looks the slug up among public collections', async () => {
    queryCm.mockResolvedValue([{ id: 'a' }]);

    await expect(findCollection(log, 'cncf')).resolves.toEqual({ id: 'a' });
    expect(sql()).toContain(`c.slug = $1 AND ${visible}`);
    expect(params()).toEqual(['cncf']);
  });

  it('returns null for an unknown or private slug', async () => {
    await expect(findCollection(log, 'private-one')).resolves.toBeNull();
  });
});

describe('findCollectionMembers', () => {
  it('returns the project ids and repository URLs of a public collection', async () => {
    const members = { id: 'a', projectIds: ['p1'], repositoryUrls: ['https://github.com/a/b'] };
    queryCm.mockResolvedValue([members]);

    await expect(findCollectionMembers(log, 'cncf')).resolves.toEqual(members);
    expect(sql()).toContain(`c.slug = $1 AND ${visible}`);
    expect(params()).toEqual(['cncf']);
  });

  it('returns null for an unknown or private slug', async () => {
    await expect(findCollectionMembers(log, 'private-one')).resolves.toBeNull();
  });
});

describe('collectionExists', () => {
  it('asks for one id of a public collection, by slug, without the member lists', async () => {
    queryCm.mockResolvedValue([{ id: 'a' }]);

    await expect(collectionExists(log, 'cncf')).resolves.toBe(true);
    expect(sql()).toContain(`c.slug = $1 AND ${visible}`);
    expect(normalized()).toContain('LIMIT 1');
    expect(sql()).not.toContain('collectionsInsightsProjects');
    expect(params()).toEqual(['cncf']);
  });

  it('is false for an unknown or private slug', async () => {
    await expect(collectionExists(log, 'private-one')).resolves.toBe(false);
  });
});
