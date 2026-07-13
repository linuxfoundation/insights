// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import type { CollectionContributorLeaderboardItem } from '~~/types/collection';
import { CommunityCollectionRepository } from '~~/server/repo/communityCollection.repo';
import { postToTinybird } from '~~/server/data/tinybird/tinybird';
import { getOptionalUser } from '~~/server/utils/jwt';

/**
 * API Endpoint: /api/collection/:slug/contributors
 * Method: GET
 * Description: Fetches the top contributors leaderboard aggregated across every project in a collection.
 *
 * URL Parameters:
 * - slug (string): The unique slug identifier for the collection.
 *
 * Response:
 * - Array of up to 20 contributors, ranked by total contribution count.
 *
 * Errors:
 * - 404: Collection not found
 * - 503: Database not available
 * - 500: Internal server error
 */
export default defineEventHandler(
  async (event): Promise<CollectionContributorLeaderboardItem[]> => {
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
        return [];
      }

      try {
        const response = await postToTinybird<CollectionContributorLeaderboardItem[]>(
          '/v0/pipes/collection_contributors_leaderboard_aggregate.json',
          { ids: projectIds },
        );

        return response.data;
      } catch (tinybirdError: unknown) {
        // Degrade gracefully: this is a supplementary aggregate widget, so an upstream
        // Tinybird failure should render an empty state rather than break the page.
        console.error(
          'Error fetching collection contributors leaderboard from Tinybird:',
          tinybirdError,
        );
        return [];
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }
      console.error('Error fetching collection contributors leaderboard:', error);
      throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
    }
  },
);
