// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {ExploreOrganizations} from "~~/types/explore/organizations";

export default defineEventHandler(async (event): Promise<ExploreOrganizations[] | Error> => {
    const query = getQuery(event);
    // Pagination parameters
    const page: number = +(query?.page ?? 0);
    const pageSize: number = +(query?.pageSize ?? 10);
    try {
        const res = await fetchFromTinybird<ExploreOrganizations[]>('/v0/pipes/top_active_organizations.json', {
            page,
            pageSize
        });
        return res.data;
    } catch (err) {
        console.error('Error fetching top active organizations:', err);
        return createError({statusCode: 500, statusMessage: 'Internal server error'});
    }
});
