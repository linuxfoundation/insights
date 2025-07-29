// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";

interface OrgMaintainers {
    date: string,
    contributorCount: number,
    maintainersCount: number
}

export default defineEventHandler(async (event): Promise<OrgMaintainers[]> => {
    const query = getQuery(event);
    const project: string = query?.project as string;
    if(!project){
        throw createError({statusCode: 422, statusMessage: 'Project is required'});
    }

    const organizationId: string = query?.organizationId as string;
    if(!organizationId){
        throw createError({statusCode: 422, statusMessage: 'Organization ID is required'});
    }

    try {
        const res = await fetchFromTinybird<OrgMaintainers[]>('/v0/pipes/org_dash_maintainers.json', {
            project,
            organizationId,
        });

        return res.data;
    } catch (error) {
        console.error('Error fetching organization dashboard maintainers from TinyBird:', error);
        throw createError({statusCode: 500, statusMessage: 'Internal Server Error'});
    }
});
