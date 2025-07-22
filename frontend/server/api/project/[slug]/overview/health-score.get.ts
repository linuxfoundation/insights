// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Query params:
 * - project: string
 * - repository: string
 */
import {DateTime} from 'luxon';

import {
    createHealthScoreSchema,
    fetchHealthScoreMetrics,
    HealthScoreFilters
} from "~~/server/helpers/health-score.helpers";


export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const project = (event.context.params as { slug: string }).slug;
    const repos = Array.isArray(query.repos) ? query.repos : query.repos ? [query.repos] : undefined;

    const filter: HealthScoreFilters = {
        project,
        repos,
    };

    if (query.startDate && (query.startDate as string).trim() !== '') {
        filter.startDate = DateTime.fromISO(query.startDate as string);
    }

    if (query.endDate && (query.endDate as string).trim() !== '') {
        filter.endDate = DateTime.fromISO(query.endDate as string);
    }
    try {

        const healthScore = await fetchHealthScoreMetrics(filter);

        return createHealthScoreSchema(healthScore);

    } catch (error) {
        console.error('Error fetching active contributors:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch health score',
            data: {message: error.message}
        });
    }
});
