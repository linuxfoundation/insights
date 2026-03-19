// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import type { Pagination } from '~~/types/shared/pagination';
import type { Collection } from '~~/types/collection';
import type { ProjectInsightsTinybird } from '~~/types/project';
import { useRuntimeConfig } from '#imports';
import { CommunityCollectionRepository } from '~~/server/repo/communityCollection.repo';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';

/**
 * API Endpoint: /api/collection
 * Method: GET
 * Description: Fetches a paginated list of collections with optional sorting and count information.
 *
 * Query Parameters:
 * - sort (string, optional): Field to sort the results by.
 * - categories (string, optional): Filter by category IDs (comma-separated).
 * - type (string, optional): Filter by type: "community" (has ssoUserId) or "curated" (no ssoUserId).
 * - search (string, optional): Search by name.
 * - page (number, optional): The page number to fetch (default is 0).
 * - pageSize (number, optional): The number of items per page (default is 10).
 *
 * Response:
 * - page (number): The current page number.
 * - pageSize (number): The number of items returned per page.
 * - total (number): The total number of items.
 * - data (Array<Collection>): The list of collections.
 *
 * Errors:
 * - 500: Internal Server Error
 */

export default defineEventHandler(async (event): Promise<Pagination<Collection> | Error> => {
  const query = getQuery(event);
  const sort: string = (query?.sort as string) || 'name_asc';
  const categories: string | undefined = (query?.categories as string) || undefined;
  const search: string | undefined = (query?.search as string) || undefined;
  const type: string | undefined = (query?.type as string) || undefined;
  const [orderByField, orderByDirection] = sort.split('_');

  // Pagination parameters
  const page: number = Number(query?.page) || 0;
  const pageSize: number = Number(query?.pageSize) || 10;

  const cmDbPool = event.context.cmDbPool as Pool | undefined;

  if (!cmDbPool) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' });
  }

  try {
    const config = useRuntimeConfig();
    const { highlightedIds } = config;
    const parsedIds: string[] = highlightedIds?.split(',') || [];
    const repo = new CommunityCollectionRepository(cmDbPool);

    const isFetchByIds =
      sort.includes('starred') && type === 'curated' && pageSize < parsedIds.length;

    const result = isFetchByIds
      ? await repo.query({
          page,
          pageSize,
          search,
          categoryIds: categories,
          type,
          ids: parsedIds.slice(0, pageSize),
        })
      : await repo.query({
          page,
          pageSize,
          search,
          categoryIds: categories,
          type,
          orderByField,
          orderByDirection,
        });

    let data = result.data as unknown as (Collection & {
      _needsFeaturedFallback?: boolean;
      _projectIds?: string[];
    })[];

    // NOTE: This is a temporary workaround to highlight one of the featured collections
    // TODO: Remove this once we have a more permanent solution
    if (sort.includes('starred')) {
      const existingHighlightedIds = parsedIds.filter((id: string) =>
        data.some((item) => item.id === id),
      );

      if (existingHighlightedIds.length > 0) {
        const highlightedItems = existingHighlightedIds
          .map((highlightId) => data.find((item) => item.id === highlightId))
          .filter((item): item is Collection => item !== undefined);

        const nonHighlightedItems = data.filter(
          (item) => !existingHighlightedIds.includes(item.id),
        );

        data = [...highlightedItems, ...nonHighlightedItems];
      }
      data = data.slice(0, pageSize);
    }

    // Fetch featured projects from Tinybird for collections without starred projects
    const collectionsNeedingFallback = data.filter((c) => c._needsFeaturedFallback);
    if (collectionsNeedingFallback.length > 0) {
      // Collect all unique project IDs across all collections needing fallback
      const allProjectIds = [
        ...new Set(collectionsNeedingFallback.flatMap((c) => c._projectIds || [])),
      ];

      if (allProjectIds.length > 0) {
        try {
          const response = await fetchFromTinybird<ProjectInsightsTinybird[]>(
            '/v0/pipes/project_insights.json',
            {
              ids: allProjectIds,
              orderByField: 'contributorCount',
              orderByDirection: 'desc',
              pageSize: allProjectIds.length,
              page: 0,
            },
          );

          // Tinybird returns projects sorted by contributorCount desc
          const tinybirdProjects = response.data.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            logo: p.logoUrl,
          }));

          for (const collection of collectionsNeedingFallback) {
            const projectIdSet = new Set(collection._projectIds || []);
            // Filter to this collection's projects, preserving Tinybird sort order
            const featured = tinybirdProjects
              .filter((p) => projectIdSet.has(p.id))
              .slice(0, 5)
              .map(({ name, slug, logo }) => ({ name, slug, logo }));

            collection.featuredProjects = featured;
          }
        } catch (error) {
          console.error('Error fetching featured projects from Tinybird:', error);
        }
      }
    }

    // Clean up internal fields before returning
    const cleanData: Collection[] = data.map(
      ({ _needsFeaturedFallback, _projectIds, ...rest }) => rest as Collection,
    );

    return {
      page,
      pageSize,
      total: result.total,
      data: cleanData,
    };
  } catch (error) {
    console.error('Error fetching collections from DB:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
