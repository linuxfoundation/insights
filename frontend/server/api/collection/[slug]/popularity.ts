// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import type { CollectionPopularityAggregate } from '~~/types/collection';
import { CommunityCollectionRepository } from '~~/server/repo/communityCollection.repo';
import { postToTinybird } from '~~/server/data/tinybird/tinybird';
import { getOptionalUser } from '~~/server/utils/jwt';

const EMPTY_RESULT: CollectionPopularityAggregate = {
  totalStars: 0,
  totalForks: 0,
  starsPrevious365Days: 0,
  forksPrevious365Days: 0,
};

/**
 * API Endpoint: /api/collection/:slug/popularity
 * Method: GET
 * Description: Fetches stars/forks popularity metrics aggregated across every project in a collection,
 * for the current and previous 365-day windows.
 *
 * URL Parameters:
 * - slug (string): The unique slug identifier for the collection.
 *
 * Errors:
 * - 404: Collection not found
 * - 503: Database not available
 * - 500: Internal server error
 */
export default defineEventHandler(async (event): Promise<CollectionPopularityAggregate> => {
  const { slug } = event.context.params as Record<string, string>;

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    const repo = new CommunityCollectionRepository(cmDbPool);
    const user = getOptionalUser(event);
    const result = await repo.findProjectIdsBySlug(slug, user?.sub ?? null);

    if (!result) {
      throw createError({ statusCode: 404, statusMessage: 'Collection not found' });
    }

    const { projectIds } = result;

    if (projectIds.length === 0) {
      return EMPTY_RESULT;
    }

    try {
      const response = await postToTinybird<CollectionPopularityAggregate[]>(
        '/v0/pipes/collection_popularity_aggregate.json',
        { ids: projectIds },
      );

      return response.data[0] ?? EMPTY_RESULT;
    } catch (tinybirdError: unknown) {
      // Degrade gracefully: this is a supplementary aggregate widget, so an upstream
      // Tinybird failure should render an empty state rather than break the page.
      console.error('Error fetching collection popularity aggregate from Tinybird:', tinybirdError);
      return EMPTY_RESULT;
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error fetching collection popularity aggregate:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
