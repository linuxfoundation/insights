// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import type { Collection } from '~~/types/collection';
import type { ProjectInsightsTinybird } from '~~/types/project';
import { CommunityCollectionRepository } from '~~/server/repo/communityCollection.repo';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';

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
    const collection = await repo.findBySlug(slug);

    if (!collection) {
      throw createError({ statusCode: 404, statusMessage: 'Collection not found' });
    }

    // Fetch featured projects from Tinybird sorted by contributorCount
    if (collection._needsTinybirdSort && collection._projectIds.length > 0) {
      try {
        const response = await fetchFromTinybird<ProjectInsightsTinybird[]>(
          '/v0/pipes/project_insights.json',
          {
            ids: collection._projectIds,
            orderByField: 'contributorCount',
            orderByDirection: 'desc',
            pageSize: 5,
            page: 0,
          },
        );

        collection.featuredProjects = response.data.map((p) => ({
          name: p.name,
          slug: p.slug,
          logo: p.logoUrl,
        }));
      } catch (error) {
        console.error('Error fetching featured projects from Tinybird:', error);
      }
    }

    const { _needsTinybirdSort, _projectIds, ...result } = collection;

    return result as unknown as Collection;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Error fetching collection from DB:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
