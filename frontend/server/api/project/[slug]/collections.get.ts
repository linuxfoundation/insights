// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { DecodedOidcToken } from '~~/types/auth/auth-jwt.types';
import type { ProjectTinybird } from '~~/types/project';

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
 * Description: Fetches collections that include the given project — either by a direct
 * project link or by any repository belonging to the project. Includes public collections
 * as well as private collections owned by the authenticated user.
 *
 * URL Parameters:
 * - slug (string): The unique slug identifier for the project.
 *
 * Response:
 * - collections (Array): Public collections plus the authenticated user's own private collections.
 * - publicCount (number): Total number of public collections referencing the project.
 * - privateCount (number): Total number of private collections referencing the project (all users).
 *
 * Errors:
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
    const user = event.context.user as DecodedOidcToken | undefined;
    const ssoUserId: string | null = user?.sub ?? null;

    const [projectResult, projectTinybird] = await Promise.all([
      cmDbPool.query(`SELECT id FROM "insightsProjects" WHERE slug = $1 AND "deletedAt" IS NULL`, [
        slug,
      ]),
      fetchFromTinybird<ProjectTinybird[]>('/v0/pipes/projects_list.json', {
        slug,
        details: true,
      }),
    ]);
    const projectId: string | null = projectResult.rows[0]?.id ?? null;
    const repoUrls: string[] = projectTinybird.data?.[0]?.repositories ?? [];

    if (!projectId && repoUrls.length === 0) {
      return { collections: [], publicCount: 0, privateCount: 0 };
    }

    const result = await cmDbPool.query(
      `WITH matching_collections AS (
         SELECT DISTINCT c.id, c.name, c.slug, c."logoUrl", c."isPrivate", c."ssoUserId"
         FROM collections c
         LEFT JOIN "collectionsInsightsProjects" cip
           ON cip."collectionId" = c.id AND cip."deletedAt" IS NULL
         LEFT JOIN "collectionsRepositories" cr
           ON cr."collectionId" = c.id AND cr."deletedAt" IS NULL
         LEFT JOIN repositories r
           ON r.id = cr."repoId" AND r."deletedAt" IS NULL
         WHERE c."deletedAt" IS NULL
           AND (cip."insightsProjectId" = $1 OR r.url = ANY($2))
       )
       SELECT
         json_agg(
           json_build_object('name', name, 'slug', slug, 'logo', "logoUrl")
           ORDER BY name ASC
         ) FILTER (WHERE "isPrivate" = false OR "ssoUserId" = $3) AS collections,
         COUNT(*) FILTER (WHERE "isPrivate" = false)::int AS "publicCount",
         COUNT(*) FILTER (WHERE "isPrivate" = true)::int AS "privateCount"
       FROM matching_collections`,
      [projectId, repoUrls, ssoUserId],
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
