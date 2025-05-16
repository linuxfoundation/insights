// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {OSSIndexCategory, OSSIndexCategoryTinybird} from "~~/types/ossindex/category";

/**
 * API endpoint to fetch OSS Index categories from TinyBird
 *
 * @route GET /api/ossindex/categories
 * @param {string} [categoryGroupSlug] - Filter by category group slug
 * @returns {Promise<OSSIndexCategoryGroup[]>} Array of categories with top collections and projects
 * @throws {Error} 500 error if TinyBird API request fails
 */
export default defineEventHandler(async (event): Promise<OSSIndexCategory[] | Error> => {
    const query = getQuery(event);
    const categoryGroupSlug: string = (query?.categoryGroupSlug as string);

    try {
        const res = await fetchFromTinybird<OSSIndexCategoryTinybird[]>(
            '/v0/pipes/categories_oss_index.json',
            {
                categoryGroupSlug,
            }
        );

        return res.data.map((item) => ({
            ...item,
            topCollections: item.topCollections.map((collection) => {
                const [id, count, name] = collection;
                return {
                    id: id as string,
                    count: count as number,
                    name: name as string,
                };
            }),
            topProjects: item.topProjects.map((collection) => {
                const [id, count, name, logo] = collection;
                return {
                    id: id as string,
                    count: count as number,
                    name: name as string,
                    logo: logo as string,
                };
            })
        }))
    } catch (error) {
        console.error('Error fetching oss index category list from TinyBird:', error);
        throw createError({statusCode: 500, statusMessage: 'Internal Server Error'});
    }
});
