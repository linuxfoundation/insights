// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import type { Collection } from '~~/types/collection';
import { CommunityCollectionRepository } from '~~/server/repo/communityCollection.repo';
import { getOptionalUser } from '~~/server/utils/jwt';

/**
 * API Endpoint: Fetch Collection Details by Slug
 *
 * Method: GET
 * URL: /api/collection/:slug
 *
 * Description:
 * This endpoint retrieves details of a specific collection identified by its slug.
 *
 * Request Parameters:
 * - slug (string) [URL Parameter]: The unique slug identifier for the collection.
 *
 * Response:
 * - 200 OK: Returns the collection details.
 * - 404 Not Found: If the collection with the provided slug does not exist.
 * - 500 Internal Server Error: If an unexpected error occurs.
 */
export default defineEventHandler(async (event): Promise<Collection | Error> => {
  const { slug } = event.context.params as Record<string, string>;

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    const repo = new CommunityCollectionRepository(cmDbPool);
    const user = getOptionalUser(event);
    const collection = await repo.findBySlug(slug, user?.sub ?? null);

    if (!collection) {
      throw createError({ statusCode: 404, statusMessage: 'Collection not found' });
    }

    return collection as unknown as Collection;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error fetching collection from DB:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
