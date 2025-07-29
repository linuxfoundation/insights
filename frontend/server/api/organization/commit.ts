// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";

interface OrgCommit {
    date: string,
    commits: number,
    orgCommits: number
}

export default defineEventHandler(async (event): Promise<OrgCommit[]> => {
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
        const res = await fetchFromTinybird<OrgCommit[]>('/v0/pipes/org_dash_commit.json', {
            project,
            organizationId,
        });

        return res.data;
    } catch (error) {
        console.error('Error fetching organization dashboard commits from TinyBird:', error);
        throw createError({statusCode: 500, statusMessage: 'Internal Server Error'});
    }
});
