// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import {formatNumberShort} from "~/components/shared/utils/formatter";
import type {ProjectTinybird} from "~~/types/project";

export default defineEventHandler(
    async (event): Promise<void> => {
        const query = getQuery(event);
        const project: string = query?.project as string;

        try {
            const res =
                await fetchFromTinybird<ProjectTinybird[]>('/v0/pipes/projects_list.json', {slug: project});
            if (!res.data || res.data.length === 0) {
                return;
            }
            const contributorCount = res.data[0].contributorCount;
            const label = encodeURIComponent('Contributors');
            const message = encodeURIComponent(formatNumberShort(contributorCount || 0));
            const url = `https://img.shields.io/static/v1?label=${label}&message=${message}&color=0094FF&logo=linuxfoundation&logoColor=white&style=flat`

            return sendRedirect(event, url, 302)

        } catch (error) {
            console.error('Error fetching badge', error);
            throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
        }
    }
);
