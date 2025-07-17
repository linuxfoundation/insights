// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from "luxon";
import {HealthScoreResults, HealthScoreTinybird} from "~~/types/overview/responses.types";
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";


export interface HealthScoreFilters {
    project: string;
    repos?: string[];
    startDate?: DateTime;
    endDate?: DateTime;
}

const healthScores: string[] = [
    'active_contributors',
    'contributor_dependency',
    'organization_dependency',
    'retention',
    'stars',
    'forks',
    'issues_resolution',
    'pull_requests',
    'merge_lead_time',
    'active_days',
    'contributions_outside_work_hours',
    'search_volume',
    'security',
]

const fetchHealthScore = async (name: string, filter: HealthScoreFilters) => {
    const res = await fetchFromTinybird<HealthScoreTinybird[]>(`/v0/pipes/health_score_${name}.json`, filter);
    if (!res.data || res.data.length === 0) {
        throw createError({statusCode: 404, statusMessage: 'Not found'});
    }
    return res.data[0];
}

export const fetchHealthScoreMetrics = async (filter: HealthScoreFilters): Promise<HealthScoreTinybird> => {
    const data = await Promise.all(
        healthScores.map(name => fetchHealthScore(name, filter))
    );
    return data.reduce((mapped, scores) => ({
        ...mapped,
        ...scores,
    }), {} as HealthScoreTinybird)
}


export function createHealthScoreSchema(healthScore: HealthScoreTinybird): HealthScoreResults {
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
        securityCategoryPercentage: (healthScore.securityCategoryPercentage || []).map(score => {
            const [category, percentage] = score;
            return {
                category,
                percentage
            };
        }),
        contributorPercentage: healthScore.contributorPercentage || 0,
        popularityPercentage: healthScore.popularityPercentage || 0,
        developmentPercentage: healthScore.developmentPercentage || 0,
        securityPercentage: healthScore.securityPercentage || 0,
        overallScore: healthScore.overallScore || 0,
    }
}

