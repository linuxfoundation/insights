// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { ActivityTypes } from '@lfx-insights/types';

import { fetchActivityCounts } from '../../../lib/activity-count.js';
import {
  countType,
  periodSummary,
  ProjectSlugParams,
  SeriesQuery,
} from '../../../schemas/common.js';

const CommitActivitiesQuery = Type.Object({
  ...SeriesQuery.properties,
  countType: countType('the commits made'),
});

const CommitSummary = periodSummary({
  measure: 'Commits',
  unit: 'count',
  kind: 'integer',
  description: 'Commit totals for the current period against the previous one.',
});

const CommitActivities = Type.Object({
  summary: CommitSummary,
  data: Type.Array(
    Type.Object({
      startDate: Type.String({ format: 'date-time', description: 'Start of the bucket, UTC.' }),
      endDate: Type.String({ format: 'date-time', description: 'End of the bucket, UTC.' }),
      commits: Type.Integer({
        description:
          'Commits in the bucket, or the running total up to its end when countType=cumulative (count).',
      }),
    }),
    { description: 'One row per time bucket of the requested granularity.' },
  ),
});

const commitActivityRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/commit-activities',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get commit activities',
        description:
          'Returns commit counts per time bucket of the requested granularity, as new commits in each bucket or as a cumulative total, plus a summary comparing the current period with the comparison period before it. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. An unknown project returns zero counts and an empty `data` list.',
        params: ProjectSlugParams,
        querystring: CommitActivitiesQuery,
        response: { 200: CommitActivities },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { summary, data } = await fetchActivityCounts(request, slug, request.query, {
        activity_type: ActivityTypes.AUTHORED_COMMIT,
        onlyContributions: true,
        includeCodeContributions: true,
        includeCollaborations: false,
      });
      return { summary, data: data.map(({ count, ...bucket }) => ({ ...bucket, commits: count })) };
    },
  );
};

export default commitActivityRoutes;
