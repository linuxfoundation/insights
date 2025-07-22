// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { OSSIndexCollectionTinybird } from '~~/types/ossindex/collection';
import type { Category } from '~~/types/category/category';
import type { OSSIndexCategoryDetails } from '~~/types/ossindex/category';

/**
 * API endpoint to fetch OSS Index collections from TinyBird
 *
 * @route GET /api/ossindex/collections
 * @param {string} [categorySlug] - filter by category slug
 * @returns {Promise<OSSIndexCategoryGroup[]>} Array of collections with top projects
 * @throws {Error} 500 error if TinyBird API request fails
 */
export default defineEventHandler(
  async (event): Promise<OSSIndexCategoryDetails | Error> => {
    const query = getQuery(event);
    const categorySlug: string = query?.categorySlug as string;
    const sort: string = query?.sort as string;

    try {
      const resDetails = await fetchFromTinybird<Category[]>(
        '/v0/pipes/category_list.json',
        {
          slug: categorySlug
        }
      );

      const details: Category | undefined = resDetails.data.at(0);

      if (!details) {
        throw createError({ statusCode: 404, statusMessage: 'Category not found' });
      }

      const res = await fetchFromTinybird<OSSIndexCollectionTinybird[]>(
        '/v0/pipes/collections_oss_index.json',
        {
          categorySlug,
          orderBy: sort,
        }
      );

      const collections = res.data.map((item) => ({
        ...item,
        topProjects: item.topProjects.map((project) => {
          const [id, count, name, logo, softwareValue, avgScore, healthScore, description] = project;
          return {
            id: id as string,
            count: count as number,
            name: name as string,
            logo: logo as string,
            description: description as string,
            softwareValue: softwareValue as number,
            avgScore: avgScore as number,
            healthScore: healthScore as number,
          };
        })
      }));

      return {
        ...details,
        collections
      };
    } catch (error) {
      console.error('Error fetching oss index collection list from TinyBird:', error);
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
  }
);
