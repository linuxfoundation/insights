// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {OSSIndexCategoryGroup, OSSIndexCategoryGroupTinybird} from "~~/types/ossindex/category-group";

/**
 * API endpoint to fetch OSS Index category groups from TinyBird
 *
 * @route GET /api/ossindex/groups
 * @param {string} [type] - Optional filter to get groups of specific type
 * @returns {Promise<OSSIndexCategoryGroup[]>} Array of category groups with top collections and projects
 * @throws {Error} 500 error if TinyBird API request fails
 */
export default defineEventHandler(async (event): Promise<OSSIndexCategoryGroup[] | Error> => {
    const query = getQuery(event);
    const type: string = (query?.type as string);
    const sort: string = (query?.sort as string);

    try {
        const res = await fetchFromTinybird<OSSIndexCategoryGroupTinybird[]>(
            '/v0/pipes/category_groups_oss_index.json',
            {
                type,
                orderBy: sort,
            }
        );

        return res.data.map((item) => ({
            ...item,
            topCollections: item.topCollections.map((collection) => {
                const [id, count, name, softwareValue, avgScore] = collection;
                return {
                    id: id as string,
                    count: count as number,
                    name: name as string,
                    softwareValue: softwareValue as number,
                    avgScore: avgScore as number,
                };
            }),
            topProjects: item.topProjects.map((collection) => {
                const [id, count, name, logo, softwareValue, avgScore] = collection;
                return {
                    id: id as string,
                    count: count as number,
                    name: name as string,
                    logo: logo as string,
                    softwareValue: softwareValue as number,
                    avgScore: avgScore as number,
                };
            })
        }))
    } catch (error) {
        console.error('Error fetching oss index category group list from TinyBird:', error);
        throw createError({statusCode: 500, statusMessage: 'Internal Server Error'});
    }
});
