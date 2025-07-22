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
    return res.data?.[0];
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
            benchmark: healthScore.activeContributorsBenchmark || 0,
            value: healthScore.activeContributors || 0,
        },
        contributorDependency: {
            value: healthScore.contributorDependencyCount || 0,
            percentage: healthScore.contributorDependencyPercentage || 0,
            benchmark: healthScore.contributorDependencyBenchmark || 0,
        },
        organizationDependency: {
            value: healthScore.organizationDependencyCount || 0,
            percentage: healthScore.organizationDependencyPercentage || 0,
            benchmark: healthScore.organizationDependencyBenchmark || 0,
        },
        retention: {
            value: healthScore.retentionRate || 0,
            benchmark: healthScore.retentionBenchmark || 0,
        },
        stars: {
            value: healthScore.stars || 0,
            benchmark: healthScore.starsBenchmark || 0,
        },
        forks: {
            value: healthScore.forks || 0,
            benchmark: healthScore.forksBenchmark || 0,
        },
        issuesResolution: {
            value: healthScore.issueResolution || 0,
            benchmark: healthScore.issueResolutionBenchmark || 0,
        },
        pullRequests: {
            value: healthScore.pullRequests || 0,
            benchmark: healthScore.pullRequestsBenchmark || 0,
        },
        mergeLeadTime: {
            value: healthScore.mergeLeadTime || 0,
            benchmark: healthScore.mergeLeadTimeBenchmark || 0,
        },
        activeDays: {
            value: healthScore.activeDaysCount || 0,
            benchmark: healthScore.activeDaysBenchmark || 0,
        },
        contributionsOutsideWorkHours: {
            value: healthScore.contributionsOutsideWorkHours || 0,
            benchmark: healthScore.contributionsOutsideWorkHoursBenchmark || 0,
        },
        searchQueries: {
            value: healthScore.searchVolumeAverage || 0,
            benchmark: healthScore.searchVolumeBenchmark || 0,
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

