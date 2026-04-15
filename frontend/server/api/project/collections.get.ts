// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import { getOptionalUser } from '../../utils/jwt';

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
 * API Endpoint: /api/project/collections
 * Method: GET
 * Description: Fetches collections that directly include the given project via
 * `collectionsInsightsProjects`. Includes public collections as well as private
 * collections owned by the authenticated user.
 *
 * Query Parameters:
 * - slug (string): The unique slug identifier for the project.
 *
 * Response:
 * - collections (Array): Public collections plus the authenticated user's own private collections.
 * - publicCount (number): Total number of public collections referencing the project.
 * - privateCount (number): Total number of private collections referencing the project (all users).
 *
 * Errors:
 * - 400: Missing slug
 * - 503: Database not available
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<ProjectCollectionsResponse | Error> => {
  const query = getQuery(event);
  const slug = query?.slug as string | undefined;

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug query parameter is required' });
  }

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    const user = getOptionalUser(event);
    const ssoUserId: string | null = user?.sub ?? null;

    const projectResult = await cmDbPool.query(
      `SELECT id FROM "insightsProjects" WHERE slug = $1 AND "deletedAt" IS NULL`,
      [slug],
    );
    const projectId: string | null = projectResult.rows[0]?.id ?? null;

    if (!projectId) {
      return { collections: [], publicCount: 0, privateCount: 0 };
    }

    const result = await cmDbPool.query(
      `WITH matching_collections AS (
         SELECT DISTINCT c.id, c.name, c.slug, c."logoUrl", c."isPrivate", c."ssoUserId"
         FROM collections c
         JOIN "collectionsInsightsProjects" cip
           ON cip."collectionId" = c.id AND cip."deletedAt" IS NULL
         WHERE c."deletedAt" IS NULL
           AND cip."insightsProjectId" = $1
       )
       SELECT
         json_agg(
           json_build_object('name', name, 'slug', slug, 'logo', "logoUrl")
           ORDER BY name ASC
         ) FILTER (WHERE "isPrivate" = false OR "ssoUserId" = $2) AS collections,
         COUNT(*) FILTER (WHERE "isPrivate" = false)::int AS "publicCount",
         COUNT(*) FILTER (WHERE "isPrivate" = true)::int AS "privateCount"
       FROM matching_collections`,
      [projectId, ssoUserId],
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
    console.error('Error fetching project collections:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
