// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {Pagination} from "~~/types/shared/pagination";
import type {Collection} from "~~/types/collection";

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

// NOTE: This is a temporary workaround to highlight one of the featured collections
const highlightId = '08c19065-41f5-4ba4-b4d8-5984c5725ff1';

export default defineEventHandler(async (event): Promise<Pagination<Collection> | Error> => {
    const query = getQuery(event);
    const sort: string = (query?.sort as string) || 'name_asc';
    const category: string | undefined = (query?.category as string) || undefined;
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
            categoryIds: category ? [category] : undefined,
            orderByField,
            orderByDirection,
        });

        // Move the highlighted item to the top if it exists
    if (highlightId) {
        const index = res.data.findIndex((item) => item.id === highlightId);
        if (index > -1) {
          const [highlightedItem] = res.data.splice(index, 1);
          res.data.unshift(highlightedItem);
        }
      }

        type CollectionCount = {'count(id)': number};
        const collectionCountResult = await fetchFromTinybird<CollectionCount[]>('/v0/pipes/collections_list.json', {
            categoryIds: category ? [category] : undefined,
            count: true,
        });

        return {
            page,
            pageSize,
            total: collectionCountResult.data[0]?.['count(id)'] || 0,
            data: res.data,
        }
    } catch (error) {
        console.error('Error fetching collection list from TinyBird:', error);
        throw createError({statusCode: 500, statusMessage: 'Internal Server Error'});
    }
});
