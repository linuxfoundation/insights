// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { Pagination } from '~~/types/shared/pagination';
import type { Collection } from '~~/types/collection';
import { useRuntimeConfig } from '#imports';

/**
 * API Endpoint: /api/collection
 * Method: GET
 * Description: Fetches a paginated list of collections with optional sorting and count information.
 *
 * Query Parameters:
 * - sort (string, optional): Field to sort the results by.
 * - category (string, optional): Filter by category.
 * - page (number, optional): The page number to fetch (default is 0).
 * - pageSize (number, optional): The number of items per page (default is 10).
 * - count (boolean, optional): Whether to include the total count of items (default is false).
 *
 * Response:
 * - page (number): The current page number.
 * - pageSize (number): The number of items returned per page.
 * - total (number): The total number of items (if count is true).
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
  const [orderByField, orderByDirection] = sort.split('_');

  // Pagination parameters
  const page: number = +(query?.page ?? 0);
  const pageSize: number = +(query?.pageSize ?? 10);
  const count: boolean = !!query?.count;

  try {
    const res = await fetchFromTinybird<Collection[]>('/v0/pipes/collections_list.json', {
      count,
      page,
      pageSize,
      search,
      categoryIds: categories?.length ? categories : undefined,
      orderByField,
      orderByDirection,
    });

    // NOTE: This is a temporary workaround to highlight one of the featured collections
    // TODO: Remove this once we have a more permanent solution
    // First find which highlighted IDs exist in the current results
    if (sort.includes('starred')) {
      const config = useRuntimeConfig();
      const { highlightedIds } = config;
      const parsedIds: string[] = highlightedIds?.split(',') || [];
      const existingHighlightedIds = parsedIds.filter((id: string) =>
        res.data.some((item) => item.id === id),
      );

      // If we have any matches, reorder the results
      if (existingHighlightedIds.length > 0) {
        // Add highlighted items in their specified order
        const highlightedItems = existingHighlightedIds
          .map((highlightId) => res.data.find((item) => item.id === highlightId))
          .filter((item): item is Collection => item !== undefined);

        // Add remaining non-highlighted items
        const nonHighlightedItems = res.data.filter(
          (item) => !existingHighlightedIds.includes(item.id),
        );

        res.data = [...highlightedItems, ...nonHighlightedItems];
      }
    }

    type CollectionCount = { 'count(id)': number };
    const collectionCountResult = await fetchFromTinybird<CollectionCount[]>(
      '/v0/pipes/collections_list.json',
      {
        categoryIds: categories?.length ? categories : undefined,
        count: true,
      },
    );

    return {
      page,
      pageSize,
      total: collectionCountResult.data[0]?.['count(id)'] || 0,
      data: res.data,
    };
  } catch (error) {
    console.error('Error fetching collection list from TinyBird:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
