// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { type Static, Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  HealthLabel,
  ImpactLabel,
  LifecycleLabel,
  nullObject,
  OverviewQuery,
} from '../../../lib/overview.js';
import { enumGuard, isCount } from '../../../lib/security.js';
import { nullableNumber, ProjectSlugParams } from '../../../schemas/common.js';

const insightsPath = '/v0/pipes/project_insights.json';
const lifecyclePath = '/v0/pipes/repo_lifecycle_v2.json';
const breakdownPath = '/v0/pipes/repo_health_score_v2_breakdown.json';

type Score = number | null;

interface CategoryRow {
  healthScoreV2: Score;
  healthLabel: Static<typeof HealthLabel>;
  maintainerHealthScoreV2: Score;
  securitySupplyChainScoreV2: Score;
  developmentActivityScoreV2: Score;
}

interface InsightsRow extends CategoryRow {
  lifecycleLabel: Static<typeof LifecycleLabel>;
  impactScore: Score;
  impactLabel: Static<typeof ImpactLabel>;
  coveredCategoryCount: Score;
  healthMaxScore: Score;
}

interface LifecycleRow {
  lifecycleLabel: Static<typeof LifecycleLabel>;
}

const upTo = (value: unknown, max: number) =>
  value === null || (isCount(value) && (value as number) <= max);
// The maxima the pipe derives from the covered categories.
const healthMaxScores = new Set<unknown>([60, 65, 75, 100, null]);
const isHealthLabel = enumGuard(HealthLabel);
const isLifecycleLabel = enumGuard(LifecycleLabel);
const isImpactLabel = enumGuard(ImpactLabel);

const isCategoryRow = (row: CategoryRow) =>
  upTo(row.healthScoreV2, 100) &&
  isHealthLabel(row.healthLabel) &&
  upTo(row.maintainerHealthScoreV2, 40) &&
  upTo(row.securitySupplyChainScoreV2, 35) &&
  upTo(row.developmentActivityScoreV2, 25);

const isInsightsRow = (row: InsightsRow) =>
  isCategoryRow(row) &&
  isLifecycleLabel(row.lifecycleLabel) &&
  upTo(row.impactScore, 100) &&
  isImpactLabel(row.impactLabel) &&
  upTo(row.coveredCategoryCount, 3) &&
  healthMaxScores.has(row.healthMaxScore) &&
  (row.healthScoreV2 === null ||
    row.healthMaxScore === null ||
    row.healthScoreV2 <= row.healthMaxScore);

const isLifecycleRow = (row: LifecycleRow) => isLifecycleLabel(row.lifecycleLabel);

const HealthScore = Type.Object({
  score: nullableNumber(
    'Health score, the sum of the three category scores, from 0 to `healthMaxScore`. ' +
      '`null` when fewer than two categories have data, for the Linux Kernel (`korg`) and for archived projects.',
  ),
  healthLabel: HealthLabel,
  lifecycleLabel: LifecycleLabel,
  impactScore: nullableNumber(
    'Impact score of the project, from 0 to 100. `null` when unknown or when `repos` is given.',
  ),
  impactLabel: ImpactLabel,
  maintainerHealthScore: nullableNumber(
    'Maintainer health category score, from 0 to 40 points. `null` when the category has no data.',
  ),
  securitySupplyChainScore: nullableNumber(
    'Security and supply chain category score, from 0 to 35 points. `null` when the category has no data.',
  ),
  developmentActivityScore: nullableNumber(
    'Development activity category score, from 0 to 25 points. `null` when the category has no data.',
  ),
  coveredCategoryCount: nullableNumber(
    'Categories with data behind the score, from 0 to 3. `null` when unknown or when `repos` is given.',
  ),
  healthMaxScore: nullableNumber(
    'Highest score the covered categories allow: the sum of their maxima, so 60, 65, 75 or 100. ' +
      '`healthLabel` bands `score` as a share of it. `null` when unknown or when `repos` is given.',
  ),
});

type HealthScoreBody = Static<typeof HealthScore>;

const allNull = nullObject(HealthScore);

const categories = (row: CategoryRow) => ({
  score: row.healthScoreV2,
  healthLabel: row.healthLabel,
  maintainerHealthScore: row.maintainerHealthScoreV2,
  securitySupplyChainScore: row.securitySupplyChainScoreV2,
  developmentActivityScore: row.developmentActivityScoreV2,
});

const healthScoreRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/overview/health-score',
    {
      schema: {
        tags: ['Overview'],
        summary: 'Get the health score',
        description:
          'Returns the health score of the project, its category scores, and the lifecycle and impact labels, as the Overview tab shows them. ' +
          'With `repos`, the score is recomputed for the selected repositories: archived ones are left out of the score but count toward `lifecycleLabel`, where the most active state wins. ' +
          'The impact fields, `coveredCategoryCount` and `healthMaxScore` exist only for the whole project, so they are `null` with `repos`. ' +
          'An archived project has `lifecycleLabel` `archived`. ' +
          'An unknown project returns every field `null`.',
        params: ProjectSlugParams,
        querystring: OverviewQuery,
        response: { 200: HealthScore },
      },
    },
    async (request): Promise<HealthScoreBody> => {
      const { slug } = request.params;
      const repos = repoFilter(request.query.repos);
      const result = await withBucket(request, slug, async (bucketId) => {
        if (!repos) {
          const [row] = await fetchPipe<InsightsRow>(
            request,
            insightsPath,
            { slug, bucketId },
            isInsightsRow,
          );
          return row
            ? {
                ...categories(row),
                lifecycleLabel: row.lifecycleLabel,
                impactScore: row.impactScore,
                impactLabel: row.impactLabel,
                coveredCategoryCount: row.coveredCategoryCount,
                healthMaxScore: row.healthMaxScore,
              }
            : allNull;
        }

        const params = { slug, bucketId, repos };
        const [[lifecycle], [breakdown]] = await Promise.all([
          fetchPipe<LifecycleRow>(request, lifecyclePath, params, isLifecycleRow),
          fetchPipe<CategoryRow>(request, breakdownPath, params, isCategoryRow),
        ]);
        return {
          ...allNull,
          ...(breakdown && categories(breakdown)),
          lifecycleLabel: lifecycle?.lifecycleLabel ?? null,
        };
      });
      return result ?? allNull;
    },
  );
};

export default healthScoreRoutes;
