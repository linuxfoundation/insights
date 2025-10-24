// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pagination } from '~~/types/shared/pagination';
import type { CategoryGroup } from '~~/types/category';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { Category } from '~~/types/category/category';

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

  // Pagination parameters
  const page: number = +(query?.page ?? 0);
  const pageSize: number = +(query?.pageSize ?? 30);

  try {
    const res = await fetchFromTinybird<Category[]>('/v0/pipes/category_list.json', {
      search,
      categoryGroupType: type,
      page,
      pageSize,
      orderBy: 'categoryGroupName',
      orderDirection: 'asc',
    });

    const rows = res.data;
    const groupedCategories = rows.reduce((acc: Record<string, CategoryGroup>, row: Category) => {
      if (!acc[row.categoryGroupId]) {
        acc[row.categoryGroupId] = {
          id: row.categoryGroupId,
          name: row.categoryGroupName,
          categories: [],
        };
      }
      acc[row.categoryGroupId].categories.push({
        id: row.id,
        name: row.name,
      });
      return acc;
    }, {});

    return {
      data: Object.values(groupedCategories),
      page: +page || 0,
      pageSize: +pageSize || 30,
      total: rows.length,
    };
  } catch (err) {
    console.error('Error fetching category list:', err);
    return createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
