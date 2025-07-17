// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {HealthScoreResults, HealthScoreTinybird} from "~~/types/overview/responses.types";


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
        contributorPercentage: healthScore.contributorPercentage,
        popularityPercentage: healthScore.popularityPercentage,
        developmentPercentage: healthScore.developmentPercentage,
        securityPercentage: healthScore.securityPercentage,
        overallScore: healthScore.overallScore,
    }
}
