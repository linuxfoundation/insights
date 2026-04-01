// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';

/**
 * API Endpoint: GET /api/collection/like/counts
 * Description: Returns like counts for multiple collections at once.
 *
 * Query Parameters:
 * - ids (string): Comma-separated list of collection IDs.
 *
 * Response:
 * - Record<string, number>: Map of collection ID to like count.
 *
 * Errors:
 * - 400: Missing or invalid ids parameter
 * - 503: Database not available
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<Record<string, number> | Error> => {
  const query = getQuery(event);
  const idsParam = query?.ids as string | undefined;

  if (!idsParam) {
    throw createError({ statusCode: 400, statusMessage: 'ids query parameter is required' });
  }

  const ids = idsParam.split(',').filter(Boolean);

  if (ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'ids must be a non-empty list' });
  }

  if (ids.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'ids must not exceed 200 items' });
  }

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    const result = await cmDbPool.query(
      `SELECT "collectionId", COUNT(*)::int AS "likeCount"
         FROM "collectionLikes"
         WHERE "collectionId" = ANY($1) AND "deletedAt" IS NULL
         GROUP BY "collectionId"`,
      [ids],
    );

    const counts: Record<string, number> = {};
    for (const id of ids) {
      counts[id] = 0;
    }
    for (const row of result.rows) {
      counts[row.collectionId] = row.likeCount;
    }

    return counts;
  } catch (error) {
    console.error('Error fetching like counts:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
