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

const ForksQuery = Type.Object({
  ...SeriesQuery.properties,
  countType: countType('the forks created'),
});

const ForksSummary = periodSummary({
  measure: 'Forks created',
  unit: 'count',
  kind: 'integer',
  description:
    'Forks created in the current period against the previous one. It counts new forks even when countType=cumulative.',
});

const Forks = Type.Object({
  summary: ForksSummary,
  data: Type.Array(
    Type.Object({
      startDate: Type.String({ format: 'date-time', description: 'Start of the bucket, UTC.' }),
      endDate: Type.String({ format: 'date-time', description: 'End of the bucket, UTC.' }),
      forks: Type.Integer({
        description:
          'Forks created in the bucket, or the running total up to its end when countType=cumulative (count).',
      }),
    }),
    { description: 'One row per time bucket of the requested granularity.' },
  ),
});

const forksRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/popularity/forks',
    {
      schema: {
        tags: ['Popularity'],
        summary: 'Get forks',
        description:
          'Returns the forks created from the project repositories per time bucket of the requested granularity, as new forks in each bucket or as a cumulative total, plus a summary comparing the forks created in the current period with the comparison period before it. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. An unknown project returns zero counts and an empty `data` list.',
        params: ProjectSlugParams,
        querystring: ForksQuery,
        response: { 200: Forks },
      },
    },
    async (request) => {
      const { slug } = request.params;
      // Forks are not contributions, so onlyContributions=false lets the pipes count them.
      const { summary, data } = await fetchActivityCounts(request, slug, request.query, {
        activity_type: ActivityTypes.FORKS,
        onlyContributions: false,
        includeCodeContributions: true,
        includeCollaborations: true,
        includeOtherContributions: true,
      });
      return { summary, data: data.map(({ count, ...bucket }) => ({ ...bucket, forks: count })) };
    },
  );
};

export default forksRoutes;
