// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from 'zod';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { HealthBreakdownResults } from '~~/types/overview/responses.types';

const querySchema = z.object({
  repos: z.union([z.string(), z.array(z.string())]).optional(),
});

export default defineEventHandler(async (event): Promise<HealthBreakdownResults> => {
  const slug = (event.context.params as { slug: string }).slug;
  const { repos: rawRepos } = await getValidatedQuery(event, querySchema.parse);
  const repos = Array.isArray(rawRepos) ? rawRepos : rawRepos ? [rawRepos] : undefined;

  try {
    // A repo filter is active: recompute the breakdown live for just the selected repos
    // (IN-1253). The pipe filters out archived/excluded repos server-side, so a selection
    // made up entirely of archived/excluded repos naturally has no matching rows - treat
    // that as "no breakdown data" rather than an error.
    if (repos && repos.length > 0) {
      const res = await fetchFromTinybird<HealthBreakdownResults[]>(
        '/v0/pipes/repo_health_score_v2_breakdown.json',
        { repos },
      );
      return (
        res.data[0] ?? {
          busFactorScore: null,
          busFactorAvailable: null,
          busFactorCount: null,
          orgDiversityScore: null,
          orgDiversityAvailable: null,
          orgCount: null,
          responsivenessScore: null,
          responsivenessAvailable: null,
          medianPrResponseS: null,
          medianIssueResponseS: null,
          isGerrit: null,
          isExcluded: null,
          openVulnScore: null,
          openVulnAvailable: null,
          openCriticals: null,
          openHighs: null,
          openModerates: null,
          scorecardScorePts: null,
          scorecardAvailable: null,
          scorecardScore: null,
          securityPracticesScore: null,
          securityPracticesAvailable: null,
          securityPolicyEnabled: null,
          branchProtectionEnabled: null,
          branchProtectionRequiredReviews: null,
          branchProtectionRequiresStatusChecks: null,
          branchProtectionAllowsForcePush: null,
          dependencyHealthScore: null,
          dependencyHealthAvailable: null,
          vulnerableDeps: null,
          releaseCadenceScore: null,
          releaseCadenceAvailable: null,
          daysSinceLatest: null,
          daysBetweenRecent: null,
          commitActivityScore: null,
          commitsLast6m: null,
          lastCommitAt: null,
          issueResolutionScore: null,
          issueResolutionAvailable: null,
          closed12m: null,
          opened12m: null,
          medianCloseS: null,
          prMergeScore: null,
          prMergeAvailable: null,
          merged12m: null,
          closedUnmerged12m: null,
          medianMergeS: null,
        }
      );
    }

    const res = await fetchFromTinybird<HealthBreakdownResults[]>(
      '/v0/pipes/project_insights_health_breakdown.json',
      {
        slug,
      },
    );
    if (!res.data || res.data.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Not found' });
    }
    return res.data[0];
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
      throw error;
    }
    console.error('Error fetching health score breakdown:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score breakdown',
    });
  }
});
