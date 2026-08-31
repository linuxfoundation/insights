// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { z } from 'zod';
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { ProjectInsightsTinybird } from '~~/types/project';
import type { HealthScoreV2Results } from '~~/types/overview/responses.types';

const querySchema = z.object({
  repos: z.union([z.string(), z.array(z.string())]).optional(),
});

interface RepoHealthScoreV2CategoryTotals {
  healthScoreV2: number | null;
  healthLabel: string | null;
  maintainerHealthScoreV2: number | null;
  securitySupplyChainScoreV2: number | null;
  developmentActivityScoreV2: number | null;
}

export default defineEventHandler(async (event): Promise<HealthScoreV2Results> => {
  const slug = (event.context.params as { slug: string }).slug;
  const { repos: rawRepos } = await getValidatedQuery(event, querySchema.parse);
  const repos = Array.isArray(rawRepos) ? rawRepos : rawRepos ? [rawRepos] : undefined;

  try {
    // A repo subset is selected: Health Score/breakdown/Lifecycle are recomputed live for just
    // those repos. Whether the total is actually displayed (vs. suppressed with the "select all
    // repositories" empty state, IN-1253 State 2) is a client-side decision based on whether the
    // selection came from the top-of-page repo filter widget or a dedicated single-repo/group
    // route — see `isRepoSelected`/`isRepoFilterActive` in overview.vue.
    if (repos && repos.length > 0) {
      const [lifecycleRes, breakdownRes] = await Promise.all([
        fetchFromTinybird<{ lifecycleLabel: string | null }[]>('/v0/pipes/repo_lifecycle_v2.json', {
          slug,
          repos,
        }),
        fetchFromTinybird<RepoHealthScoreV2CategoryTotals[]>(
          '/v0/pipes/repo_health_score_v2_breakdown.json',
          { slug, repos },
        ),
      ]);
      const breakdown = breakdownRes.data[0];
      return {
        healthScoreV2: breakdown?.healthScoreV2 ?? null,
        healthLabel: breakdown?.healthLabel ?? null,
        lifecycleLabel: lifecycleRes.data[0]?.lifecycleLabel ?? null,
        impactScore: null,
        impactLabel: null,
        maintainerHealthScoreV2: breakdown?.maintainerHealthScoreV2 ?? null,
        securitySupplyChainScoreV2: breakdown?.securitySupplyChainScoreV2 ?? null,
        developmentActivityScoreV2: breakdown?.developmentActivityScoreV2 ?? null,
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
