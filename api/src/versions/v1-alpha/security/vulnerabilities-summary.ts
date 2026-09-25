// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { type CountRow, inRange, isCount, isCountRow, isString } from '../../../lib/security.js';
import { nullableNumber, ProjectSlugParams } from '../../../schemas/common.js';

const summaryPath = '/v0/pipes/vulnerabilities_summary.json';
const listPath = '/v0/pipes/vulnerabilities_list.json';

interface SummaryRow {
  count: number;
  fixedPercentage: number;
  daysSinceLastVuln: number;
  avgCvssScore: number | null;
  ecosystems: string[];
}

const isSummaryRow = (row: SummaryRow) =>
  isCount(row.count) &&
  inRange(row.fixedPercentage, 100) &&
  isCount(row.daysSinceLastVuln) &&
  (row.avgCvssScore === null || inRange(row.avgCvssScore, 10)) &&
  Array.isArray(row.ecosystems) &&
  row.ecosystems.every(isString);

const empty = {
  count: 0,
  openCount: 0,
  fixedPercentage: 0,
  daysSinceLastVuln: null,
  avgCvssScore: null,
  ecosystems: [],
};

// Any RESOLVED row makes fixedPercentage positive, so both at 0 means the project has no rows,
// where the pipe reports daysSinceLastVuln as 0.
const toSummary = (row: SummaryRow, openCount: number) => ({
  count: row.count,
  openCount,
  fixedPercentage: row.fixedPercentage,
  daysSinceLastVuln: row.count === 0 && row.fixedPercentage === 0 ? null : row.daysSinceLastVuln,
  avgCvssScore: row.avgCvssScore,
  ecosystems: row.ecosystems.filter(Boolean).sort(),
});

const Query = Type.Object({
  repos: Type.Optional(
    Type.Array(Type.String(), {
      description:
        'Repository URLs to filter by. Each must match a repository URL exactly, as the project lists it.',
    }),
  ),
});

const Summary = Type.Object({
  count: Type.Integer({
    description: 'Vulnerabilities that are not `RESOLVED`, so `OPEN` and `FIX_AVAILABLE` (count).',
  }),
  openCount: Type.Integer({ description: 'Vulnerabilities that are `OPEN` (count).' }),
  fixedPercentage: Type.Number({
    description: 'Share of all vulnerabilities that are `RESOLVED`, from 0 to 100, two decimals.',
  }),
  daysSinceLastVuln: nullableNumber(
    'Whole days since the most recent vulnerability was first detected, `RESOLVED` ones included. `null` when the project has none.',
  ),
  avgCvssScore: nullableNumber(
    'Average CVSS score of the vulnerabilities that are not `RESOLVED`. `null` when none has a score.',
  ),
  ecosystems: Type.Array(Type.String(), {
    description: 'Package ecosystems with vulnerabilities, such as `npm` or `Go`, sorted.',
  }),
});

const vulnerabilitiesSummaryRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/security/vulnerabilities/summary',
    {
      schema: {
        tags: ['Security'],
        summary: 'Get the vulnerability summary',
        description:
          'Returns the headline vulnerability numbers of the project repositories. ' +
          'Archived repositories are left out. ' +
          'An unknown project returns zeros, with `daysSinceLastVuln` and `avgCvssScore` `null`.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: Summary },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const result = await withBucket(request, slug, (bucketId) => {
        const params = { project: slug, bucketId, repos: repoFilter(request.query.repos) };
        return Promise.all([
          fetchPipe<SummaryRow>(request, summaryPath, params, isSummaryRow),
          fetchPipe<CountRow>(
            request,
            listPath,
            { ...params, status: 'OPEN', count: true },
            isCountRow,
          ),
        ]);
      });
      if (!result) {
        return empty;
      }

      const [[summary], countRows] = result;
      return summary ? toSummary(summary, countRows[0]?.count ?? 0) : empty;
    },
  );
};

export default vulnerabilitiesSummaryRoutes;
