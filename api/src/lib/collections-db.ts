// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { queryCm } from '../clients/postgres.js';
import type { RequestLog } from '../clients/tinybird.js';
import type { CollectionRefRow, CollectionRow } from './collections.js';

// Every route reads collections through this module, so the visibility rule lives here alone.
// Private collections join once authentication supplies the caller's LFID (ADR-0007).
const visible = `c."deletedAt" IS NULL AND c."isPrivate" = false`;

const memberProjects = `
  FROM "collectionsInsightsProjects" cip
  JOIN "insightsProjects" ip ON ip.id = cip."insightsProjectId" AND ip.enabled = true
  WHERE cip."collectionId" = c.id AND cip."deletedAt" IS NULL`;

const memberRepositories = `
  FROM "collectionsRepositories" cr
  JOIN repositories r ON r.id = cr."repoId" AND r."deletedAt" IS NULL
  WHERE cr."collectionId" = c.id AND cr."deletedAt" IS NULL`;

// Nuxt shows the starred projects, or the first five by name when none is starred.
const featuredProjects = `COALESCE((
  SELECT json_agg(json_build_object('name', f.name, 'slug', f.slug, 'logoUrl', f."logoUrl") ORDER BY f.name)
  FROM (
    SELECT p.name, p.slug, p."logoUrl"
    FROM (
      SELECT ip.name, ip.slug, ip."logoUrl", cip.starred, bool_or(cip.starred) OVER () AS "anyStarred"
      ${memberProjects}
    ) p
    WHERE p.starred OR NOT p."anyStarred"
    ORDER BY p.name
    LIMIT 5
  ) f
), '[]'::json)`;

const collectionColumns = `
  c.id, c.name, c.slug, c.description, c."ssoUserId", c."logoUrl", c."imageUrl", c.color,
  c."createdAt", c."updatedAt",
  u."displayName" AS "ownerName", u."avatarUrl" AS "ownerLogo",
  (SELECT COUNT(*)::int ${memberProjects}) AS "projectCount",
  (SELECT COUNT(*)::int ${memberRepositories}) AS "repositoryCount",
  (SELECT COUNT(*)::int FROM "collectionLikes" cl
    WHERE cl."collectionId" = c.id AND cl."deletedAt" IS NULL) AS "likeCount",
  ${featuredProjects} AS "featuredProjects"`;

export const collectionSortFields = [
  'name',
  'createdAt',
  'projectCount',
  'likeCount',
  'starred',
] as const;
export type CollectionSortField = (typeof collectionSortFields)[number];

const sortExpressions: Record<CollectionSortField, string> = {
  name: 'c.name',
  createdAt: 'c."createdAt"',
  projectCount: '"projectCount"',
  likeCount: '"likeCount"',
  starred: 'c.starred',
};

export interface CollectionFilter {
  search?: string;
  categoryIds?: string[];
  type?: 'curated' | 'community';
}

export interface CollectionQuery extends CollectionFilter {
  sort: { field: CollectionSortField; direction: 'asc' | 'desc' };
  limit: number;
  offset: number;
}

// Values travel as bind parameters; only the fixed fragments above reach the SQL text.
function filterClause({ search, categoryIds, type }: CollectionFilter, params: unknown[]) {
  const conditions = [visible];
  if (search) {
    params.push(`%${search.replace(/[\\%_]/g, '\\$&')}%`);
    conditions.push(`c.name ILIKE $${params.length}`);
  }
  if (categoryIds && categoryIds.length > 0) {
    params.push(categoryIds);
    conditions.push(`c."categoryId" = ANY($${params.length})`);
  }
  if (type === 'curated') {
    conditions.push(`c."ssoUserId" IS NULL`);
  } else if (type === 'community') {
    conditions.push(`c."ssoUserId" IS NOT NULL`);
  }
  return conditions.join(' AND ');
}

// `starred` follows Nuxt: starred first, then by name, whatever the direction.
function orderClause({ field, direction }: CollectionQuery['sort']) {
  const order =
    field === 'starred'
      ? 'c.starred DESC, c.name ASC'
      : `${sortExpressions[field]} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
  // The id breaks ties, so offset pages stay stable.
  return `${order}, c.id ASC`;
}

export async function listCollections(
  request: RequestLog,
  query: CollectionQuery,
): Promise<CollectionRow[]> {
  const params: unknown[] = [];
  const where = filterClause(query, params);
  params.push(query.limit, query.offset);
  return queryCm<CollectionRow>(
    request,
    `SELECT ${collectionColumns}
     FROM collections c
     LEFT JOIN "insightsSsoUsers" u ON u.id = c."ssoUserId"
     WHERE ${where}
     ORDER BY ${orderClause(query.sort)}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
}

export async function findCollection(
  request: RequestLog,
  slug: string,
): Promise<CollectionRow | null> {
  const [row] = await queryCm<CollectionRow>(
    request,
    `SELECT ${collectionColumns}
     FROM collections c
     LEFT JOIN "insightsSsoUsers" u ON u.id = c."ssoUserId"
     WHERE c.slug = $1 AND ${visible}`,
    [slug],
  );
  return row ?? null;
}

// An unknown or deleted project matches no row, so it reads as a project without collections.
export async function listProjectCollections(
  request: RequestLog,
  projectSlug: string,
): Promise<CollectionRefRow[]> {
  return queryCm<CollectionRefRow>(
    request,
    `SELECT DISTINCT c.name, c.slug, c."logoUrl"
     FROM collections c
     JOIN "collectionsInsightsProjects" cip ON cip."collectionId" = c.id AND cip."deletedAt" IS NULL
     JOIN "insightsProjects" ip ON ip.id = cip."insightsProjectId" AND ip."deletedAt" IS NULL
     WHERE ip.slug = $1 AND ${visible}
     ORDER BY c.name, c.slug`,
    [projectSlug],
  );
}

export interface CollectionMembers {
  id: string;
  projectIds: string[];
  repositoryUrls: string[];
}

// What the Tinybird collection pipes take, and the slug lookup of the collection-scoped routes.
export async function findCollectionMembers(
  request: RequestLog,
  slug: string,
): Promise<CollectionMembers | null> {
  const [row] = await queryCm<CollectionMembers>(
    request,
    `SELECT c.id,
       COALESCE((SELECT array_agg(ip.id ORDER BY ip.id) ${memberProjects}), '{}') AS "projectIds",
       COALESCE((SELECT array_agg(r.url ORDER BY r.url) ${memberRepositories}), '{}') AS "repositoryUrls"
     FROM collections c
     WHERE c.slug = $1 AND ${visible}`,
    [slug],
  );
  return row ?? null;
}
