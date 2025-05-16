// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {OSSIndexCollectionTinybird, OSSIndexCollection} from "~~/types/ossindex/collection";

/**
 * API endpoint to fetch OSS Index collections from TinyBird
 *
 * @route GET /api/ossindex/collections
 * @param {string} [categorySlug] - filter by category slug
 * @returns {Promise<OSSIndexCategoryGroup[]>} Array of collections with top projects
 * @throws {Error} 500 error if TinyBird API request fails
 */
export default defineEventHandler(async (event): Promise<OSSIndexCollection[] | Error> => {
    const query = getQuery(event);
    const categorySlug: string = (query?.categorySlug as string);

    try {
        const res = await fetchFromTinybird<OSSIndexCollectionTinybird[]>(
            '/v0/pipes/collections_oss_index.json',
            {
                categorySlug,
            }
        );

        return res.data.map((item) => ({
            ...item,
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
        console.error('Error fetching oss index collection list from TinyBird:', error);
        throw createError({statusCode: 500, statusMessage: 'Internal Server Error'});
    }
});
