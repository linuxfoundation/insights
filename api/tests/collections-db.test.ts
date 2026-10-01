// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryCm = vi.hoisted(() => vi.fn());
vi.mock('../src/clients/postgres.js', () => ({ queryCm }));

import {
  findCollection,
  findCollectionMembers,
  listCollections,
  listProjectCollections,
  listRepositoryCollections,
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

describe('listProjectCollections', () => {
  it('returns the public collections holding the project, ordered by name', async () => {
    const rows = [{ name: 'CNCF', slug: 'cncf', logoUrl: null }];
    queryCm.mockResolvedValue(rows);

    await expect(listProjectCollections(log, 'kubernetes')).resolves.toEqual(rows);
    expect(params()).toEqual(['kubernetes']);
    expect(normalized()).toContain(`ip.slug = $1 AND ${visible}`);
    expect(normalized()).toMatch(/ORDER BY c\.name, c\.slug$/);
  });

  it('matches live memberships of a project that is not deleted', async () => {
    await listProjectCollections(log, 'kubernetes');

    expect(normalized()).toContain('JOIN "collectionsInsightsProjects" cip');
    expect(normalized()).toContain('cip."deletedAt" IS NULL');
    expect(normalized()).toContain('ip."deletedAt" IS NULL');
  });

  it('returns an empty list for an unknown project', async () => {
    await expect(listProjectCollections(log, 'no-such-project')).resolves.toEqual([]);
  });
});

describe('listRepositoryCollections', () => {
  const url = 'https://github.com/kubernetes/kubernetes';

  it('returns the public collections holding the repository, ordered by name', async () => {
    queryCm.mockResolvedValue([{ name: 'CNCF', slug: 'cncf', logoUrl: null }]);

    await expect(listRepositoryCollections(log, url)).resolves.toEqual([
      { name: 'CNCF', slug: 'cncf', logoUrl: null },
    ]);
    expect(params()).toEqual([url]);
    expect(normalized()).toContain(`AND ${visible}`);
    expect(normalized()).toMatch(/ORDER BY c\.name, c\.slug$/);
  });

  it('matches the exact URL of a repository that is not deleted, through live direct memberships', async () => {
    await listRepositoryCollections(log, url);

    expect(normalized()).toContain('r.url = $1 AND r."deletedAt" IS NULL');
    expect(normalized()).toContain('"collectionsRepositories" cr');
    expect(normalized()).toContain('cr."deletedAt" IS NULL');
    expect(normalized()).not.toContain('collectionsInsightsProjects');
  });

  it('returns null for an unknown repository', async () => {
    queryCm.mockResolvedValue([]);
    await expect(listRepositoryCollections(log, url)).resolves.toBeNull();
  });

  it('returns an empty list for a known repository in no public collection', async () => {
    queryCm.mockResolvedValue([{ name: null, slug: null, logoUrl: null }]);
    await expect(listRepositoryCollections(log, url)).resolves.toEqual([]);
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
