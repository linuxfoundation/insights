// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';
import type { Pagination } from '~~/types/shared/pagination';
import type { Collection } from '~~/types/collection';
import { useRuntimeConfig } from '#imports';
import { CommunityCollectionRepository } from '~~/server/repo/communityCollection.repo';

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
    const repo = new CommunityCollectionRepository(cmDbPool);
    const result = await repo.query({
      page,
      pageSize,
      search,
      categoryIds: categories,
      type,
      orderByField,
      orderByDirection,
    });

    let data = result.data as unknown as Collection[];

    // NOTE: This is a temporary workaround to highlight one of the featured collections
    // TODO: Remove this once we have a more permanent solution
    if (sort.includes('starred')) {
      const config = useRuntimeConfig();
      const { highlightedIds } = config;
      const parsedIds: string[] = highlightedIds?.split(',') || [];
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
    }

    return {
      page,
      pageSize,
      total: result.total,
      data,
    };
  } catch (error) {
    console.error('Error fetching collections from DB:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
