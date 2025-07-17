// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Query params:
 * - project: string
 * - repos: string[]
 */
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {HealthScoreTinybird, HealthScoreResults} from "~~/types/overview/responses.types";
import {createHealthScoreSchema} from "~~/server/helpers/health-score.helpers";

export default defineEventHandler(async (event): Promise<HealthScoreResults | unknown> => {
    const query = getQuery(event);

    const project = (event.context.params as { slug: string }).slug;

    const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

    const filter = {
        project,
        repos,
    };

    try {
        const res = await fetchFromTinybird<HealthScoreTinybird[]>('/v0/pipes/health_score_overview.json', filter);
        if (!res.data || res.data.length === 0) {
            return createError({statusCode: 404, statusMessage: 'Not found'});
        }
        const healthScore = res.data[0];

        return createHealthScoreSchema(healthScore);
    } catch (error) {
        console.error('Error fetching health score:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch health score',
        });
    }
});
