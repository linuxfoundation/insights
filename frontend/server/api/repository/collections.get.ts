// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';

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
 * Description: Fetches all public collections that include the given repository,
 * along with counts of public and private collections.
 *
 * Query Parameters:
 * - url (string): The full repository URL (e.g. https://github.com/org/repo).
 *
 * Response:
 * - collections (Array): List of public collections containing the repository.
 *   - name (string): Collection name.
 *   - slug (string): Collection slug.
 *   - logo (string | null): Collection logo URL.
 * - publicCount (number): Total number of public collections containing the repository.
 * - privateCount (number): Total number of private collections containing the repository.
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
    // Find repository by URL
    const repoResult = await cmDbPool.query(
      `SELECT id FROM repositories WHERE url = $1 AND "deletedAt" IS NULL`,
      [url],
    );

    if (repoResult.rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Repository not found' });
    }

    const repoId = repoResult.rows[0].id;

    // Fetch public collections and counts in parallel
    const [publicCollections, countsResult] = await Promise.all([
      cmDbPool.query(
        `SELECT c.name, c.slug, c."logoUrl"
         FROM collections c
         INNER JOIN "collectionsRepositories" cr ON cr."collectionId" = c.id
         WHERE cr."repoId" = $1
           AND cr."deletedAt" IS NULL
           AND c."deletedAt" IS NULL
           AND c."isPrivate" = false
         ORDER BY c.name ASC`,
        [repoId],
      ),
      cmDbPool.query(
        `SELECT
           COUNT(*) FILTER (WHERE c."isPrivate" = false)::int AS "publicCount",
           COUNT(*) FILTER (WHERE c."isPrivate" = true)::int AS "privateCount"
         FROM collections c
         INNER JOIN "collectionsRepositories" cr ON cr."collectionId" = c.id
         WHERE cr."repoId" = $1
           AND cr."deletedAt" IS NULL
           AND c."deletedAt" IS NULL`,
        [repoId],
      ),
    ]);

    return {
      collections: publicCollections.rows.map(
        (r: { name: string; slug: string; logoUrl: string | null }) => ({
          name: r.name,
          slug: r.slug,
          logo: r.logoUrl,
        }),
      ),
      publicCount: countsResult.rows[0]?.publicCount || 0,
      privateCount: countsResult.rows[0]?.privateCount || 0,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error fetching repository collections:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
