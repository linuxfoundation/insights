// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';

interface ProjectCollectionItem {
  name: string;
  slug: string;
  logo: string | null;
}

interface ProjectCollectionsResponse {
  collections: ProjectCollectionItem[];
  publicCount: number;
  privateCount: number;
}

/**
 * API Endpoint: /api/project/:slug/collections
 * Method: GET
 * Description: Fetches all public collections that include the given project,
 * along with counts of public and private collections.
 *
 * URL Parameters:
 * - slug (string): The unique slug identifier for the project.
 *
 * Response:
 * - collections (Array): List of public collections containing the project.
 *   - name (string): Collection name.
 *   - slug (string): Collection slug.
 *   - logo (string | null): Collection logo URL.
 * - publicCount (number): Total number of public collections containing the project.
 * - privateCount (number): Total number of private collections containing the project.
 *
 * Errors:
 * - 404: Project not found
 * - 503: Database not available
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<ProjectCollectionsResponse | Error> => {
  const { slug } = event.context.params as Record<string, string>;

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    // Find project by slug
    const projectResult = await cmDbPool.query(
      `SELECT id FROM "insightsProjects" WHERE slug = $1 AND "deletedAt" IS NULL`,
      [slug],
    );

    if (projectResult.rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' });
    }

    const projectId = projectResult.rows[0].id;

    // Fetch public collections and counts in parallel
    const [publicCollections, countsResult] = await Promise.all([
      cmDbPool.query(
        `SELECT c.name, c.slug, c."logoUrl"
         FROM collections c
         INNER JOIN "collectionsInsightsProjects" cip ON cip."collectionId" = c.id
         WHERE cip."insightsProjectId" = $1
           AND cip."deletedAt" IS NULL
           AND c."deletedAt" IS NULL
           AND c."isPrivate" = false
         ORDER BY c.name ASC`,
        [projectId],
      ),
      cmDbPool.query(
        `SELECT
           COUNT(*) FILTER (WHERE c."isPrivate" = false)::int AS "publicCount",
           COUNT(*) FILTER (WHERE c."isPrivate" = true)::int AS "privateCount"
         FROM collections c
         INNER JOIN "collectionsInsightsProjects" cip ON cip."collectionId" = c.id
         WHERE cip."insightsProjectId" = $1
           AND cip."deletedAt" IS NULL
           AND c."deletedAt" IS NULL`,
        [projectId],
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
    console.error('Error fetching project collections:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
