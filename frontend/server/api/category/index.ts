// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {Pagination} from "~~/types/shared/pagination";
import type {CategoryGroup} from "~~/types/category";
import {fetchFromCmApi} from "~~/server/data/cm/cm-api";

/**
 * API Endpoint: /api/category
 * Method: GET
 * Description: Fetches a list of categories.
 *
 * Query Parameters:
 * - groupType (CategoryGroupType, optional): The type of category group.
 * - query (string, optional): The search query to filter results.
 * - limit (number): The maximum number of items to fetch.
 * - offset (number): The starting point for fetching items.
 *
 * Response:
 * - offset (number): The current offset.
 * - limit (number): The number of items returned per page.
 * - rows (Array<Category>): The list of categories.
 *
 * Errors:
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event): Promise<Pagination<CategoryGroup> | Error> => {
    const query = getQuery(event);
    const search: string = (query?.search as string) || '';
    const type: string = (query?.type as string) || '';
    //
    // // Pagination parameters
    const limit: number = +(query?.limit ?? 30);
    const offset: number = +(query?.offset ?? 0);

    try {
        const res = await fetchFromCmApi<{
            limit: number,
            offset: number,
            rows: CategoryGroup[]
        }>('/category', {
            groupType: type,
            offset,
            limit,
            query: search,
        });

        return {
            page: offset / limit + 1,
            pageSize: limit,
            total: res.rows.length,
            data: res.rows,
        }
    } catch (error) {
        console.error('Error fetching collection list from TinyBird:', error);
        throw createError({statusCode: 500, statusMessage: 'Internal Server Error'});
    }
});
