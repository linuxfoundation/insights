// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from 'zod';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { ProjectInsightsTinybird } from '~~/types/project';
import type { HealthScoreV2Results } from '~~/types/overview/responses.types';

const querySchema = z.object({
  repos: z.union([z.string(), z.array(z.string())]).optional(),
});

export default defineEventHandler(async (event): Promise<HealthScoreV2Results> => {
  const slug = (event.context.params as { slug: string }).slug;
  const { repos: rawRepos } = await getValidatedQuery(event, querySchema.parse);
  const repos = Array.isArray(rawRepos) ? rawRepos : rawRepos ? [rawRepos] : undefined;

  try {
    // A repo filter is active: Health Score/Impact totals are only ever shown for the
    // full-project default (IN-1253), so only Lifecycle is fetched here, recomputed live
    // for the selected repos via the repo-filtered pipe.
    if (repos && repos.length > 0) {
      const res = await fetchFromTinybird<{ lifecycleLabel: string | null }[]>(
        '/v0/pipes/repo_lifecycle_v2.json',
        { repos },
      );
      return {
        healthScoreV2: null,
        healthLabel: null,
        lifecycleLabel: res.data[0]?.lifecycleLabel ?? null,
        impactScore: null,
        impactLabel: null,
        maintainerHealthScoreV2: null,
        securitySupplyChainScoreV2: null,
        developmentActivityScoreV2: null,
      };
    }

    const res = await fetchFromTinybird<ProjectInsightsTinybird[]>(
      '/v0/pipes/project_insights.json',
      {
        slug,
      },
    );
    if (!res.data || res.data.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Not found' });
    }
    const {
      healthScoreV2,
      healthLabel,
      lifecycleLabel,
      impactScore,
      impactLabel,
      maintainerHealthScoreV2,
      securitySupplyChainScoreV2,
      developmentActivityScoreV2,
    } = res.data[0];
    return {
      healthScoreV2,
      healthLabel,
      lifecycleLabel,
      impactScore,
      impactLabel,
      maintainerHealthScoreV2,
      securitySupplyChainScoreV2,
      developmentActivityScoreV2,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
      throw error;
    }
    console.error('Error fetching health score v2:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch health score v2',
    });
  }
});
