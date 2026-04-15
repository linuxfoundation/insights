// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import { getOptionalUser } from '../../utils/jwt';

interface RepositoryCollectionItem {
  name: string;
  slug: string;
  logo: string | null;
}

interface RepositoryCollectionsResponse {
  collections: RepositoryCollectionItem[];
  publicCount: number;
  privateCount: number;
}

/**
 * API Endpoint: /api/repository/collections
 * Method: GET
 * Description: Fetches collections that include the given repository. Includes public
 * collections as well as private collections owned by the authenticated user.
 *
 * Query Parameters:
 * - url (string): The full repository URL (e.g. https://github.com/org/repo).
 *
 * Response:
 * - collections (Array): Public collections plus the authenticated user's own private collections.
 *   - name (string): Collection name.
 *   - slug (string): Collection slug.
 *   - logo (string | null): Collection logo URL.
 * - publicCount (number): Total number of public collections containing the repository.
 * - privateCount (number): Total number of private collections containing the repository (all users).
 *
 * Errors:
 * - 400: Missing url parameter
 * - 404: Repository not found
 * - 503: Database not available
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<RepositoryCollectionsResponse | Error> => {
  const query = getQuery(event);
  const url = query.url as string | undefined;

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required query parameter: url' });
  }

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    const user = getOptionalUser(event);
    const ssoUserId: string | null = user?.sub ?? null;

    const repoResult = await cmDbPool.query(
      `SELECT id FROM repositories WHERE url = $1 AND "deletedAt" IS NULL`,
      [url],
    );

    if (repoResult.rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Repository not found' });
    }

    const repoId = repoResult.rows[0].id;

    const result = await cmDbPool.query(
      `WITH matching_collections AS (
         SELECT c.id, c.name, c.slug, c."logoUrl", c."isPrivate", c."ssoUserId"
         FROM collections c
         INNER JOIN "collectionsRepositories" cr ON cr."collectionId" = c.id
         WHERE cr."repoId" = $1
           AND cr."deletedAt" IS NULL
           AND c."deletedAt" IS NULL
       )
       SELECT
         json_agg(
           json_build_object('name', name, 'slug', slug, 'logo', "logoUrl")
           ORDER BY name ASC
         ) FILTER (WHERE "isPrivate" = false OR "ssoUserId" = $2) AS collections,
         COUNT(*) FILTER (WHERE "isPrivate" = false)::int AS "publicCount",
         COUNT(*) FILTER (WHERE "isPrivate" = true)::int AS "privateCount"
       FROM matching_collections`,
      [repoId, ssoUserId],
    );

    const row = result.rows[0];
    return {
      collections: row?.collections ?? [],
      publicCount: row?.publicCount ?? 0,
      privateCount: row?.privateCount ?? 0,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error fetching repository collections:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
