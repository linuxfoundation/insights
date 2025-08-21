// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import { OrgDashContributors} from "~~/types/organization-dashboard";

export default defineEventHandler(async (event): Promise<OrgDashContributors[]> => {
    const query = getQuery(event);
    const accountName: string = query?.accountName as string;
    const slugs = Array.isArray(query.slugs) ? query.slugs : query.slugs ? [query.slugs] : undefined;
    const page: number = query.page as number || 0;
    const pageSize: number = query.pageSize as number || 20;

    try {
        const res = await fetchFromTinybird<OrgDashContributors[]>('/v0/pipes/org_dash_metrics.json', {
            accountName,
            slugs,
            page,
            pageSize,
        });

        return res.data;
    } catch (error) {
        console.error('Error fetching organization dashboard metrics from TinyBird:', error);
        throw createError({statusCode: 500, statusMessage: 'Internal Server Error'});
    }
});
