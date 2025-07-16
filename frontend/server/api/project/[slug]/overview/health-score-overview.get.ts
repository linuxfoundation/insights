// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Query params:
 * - project: string
 * - repos: string[]
 */
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {HealthScoreTinybird, HealthScoreResults} from "~~/types/overview/responses.types";

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
        return {
            activeContributors: {
                benchmark: healthScore.activeContributorsBenchmark,
                value: healthScore.activeContributors,
            },
            contributorDependency: {
                value: healthScore.contributorDependencyCount,
                percentage: healthScore.contributorDependencyPercentage,
                benchmark: healthScore.contributorDependencyBenchmark,
            },
            organizationDependency: {
                value: healthScore.organizationDependencyCount,
                percentage: healthScore.organizationDependencyPercentage,
                benchmark: healthScore.organizationDependencyBenchmark,
            },
            retention: {
                value: healthScore.retentionRate,
                benchmark: healthScore.retentionBenchmark,
            },
            stars: {
                value: healthScore.stars,
                benchmark: healthScore.starsBenchmark,
            },
            forks: {
                value: healthScore.forks,
                benchmark: healthScore.forksBenchmark,
            },
            issuesResolution: {
                value: healthScore.issueResolution,
                benchmark: healthScore.issueResolutionBenchmark,
            },
            pullRequests: {
                value: healthScore.pullRequests,
                benchmark: healthScore.pullRequestsBenchmark,
            },
            mergeLeadTime: {
                value: healthScore.mergeLeadTime,
                benchmark: healthScore.mergeLeadTimeBenchmark,
            },
            activeDays: {
                value: healthScore.activeDaysCount,
                benchmark: healthScore.activeDaysBenchmark,
            },
            contributionsOutsideWorkHours: {
                value: healthScore.contributionsOutsideWorkHours,
                benchmark: healthScore.contributionsOutsideWorkHoursBenchmark,
            },
            searchQueries: {
                value: healthScore.searchVolumeAverage,
                benchmark: healthScore.searchVolumeBenchmark,
            },
            securityCategoryPercentage: healthScore.securityCategoryPercentage.map(score => {
                const [category, percentage] = score;
                return {
                    category,
                    percentage
                };
            }),
            contributorPercentage: healthScore.contributorPercentage,
            popularityPercentage: healthScore.popularityPercentage,
            developmentPercentage: healthScore.developmentPercentage,
            securityPercentage: healthScore.securityPercentage,
            overallScore: healthScore.overallScore,
        }
    } catch (error) {
        console.error('Error fetching health score:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch health score',
        });
    }
});
