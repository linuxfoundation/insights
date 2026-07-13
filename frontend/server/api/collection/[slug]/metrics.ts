// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import type { CollectionMetrics, CollectionMetricsTinybird } from '~~/types/collection';
import { CommunityCollectionRepository } from '~~/server/repo/communityCollection.repo';
import { postToTinybird } from '~~/server/data/tinybird/tinybird';
import { getOptionalUser } from '~~/server/utils/jwt';

/**
 * API Endpoint: /api/collection/:slug/metrics
 * Method: GET
 * Description: Fetches aggregate insights metrics (project count, unique contributor count,
 * average health score) across all projects in a collection.
 *
 * URL Parameters:
 * - slug (string): The unique slug identifier for the collection.
 *
 * Response:
 * - projectCount (number): Count of projects in the collection.
 * - uniqueContributorCount (number): Total unique contributors across all projects, deduplicated.
 * - avgHealthScore (number): Average Health Score across the collection's projects.
 *
 * Errors:
 * - 404: Collection not found
 * - 503: Database not available
 * - 500: Internal server error
 */
const EMPTY_RESULT: CollectionMetrics = {
  projectCount: 0,
  uniqueContributorCount: 0,
  avgHealthScore: 0,
};

export default defineEventHandler(async (event): Promise<CollectionMetrics> => {
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
      const response = await postToTinybird<CollectionMetricsTinybird[]>(
        '/v0/pipes/collection_insights_aggregate.json',
        {
          ids: projectIds,
        },
      );

      const [metrics] = response.data;

      return {
        projectCount: metrics?.projectCount ?? 0,
        uniqueContributorCount: metrics?.uniqueContributorCount ?? 0,
        avgHealthScore: metrics?.avgHealthScore ?? 0,
      };
    } catch (tinybirdError: unknown) {
      // Degrade gracefully: this is a supplementary aggregate widget, so an upstream
      // Tinybird failure should render an empty state rather than break the page.
      console.error('Error fetching collection metrics from Tinybird:', tinybirdError);
      return EMPTY_RESULT;
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error fetching collection metrics:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
