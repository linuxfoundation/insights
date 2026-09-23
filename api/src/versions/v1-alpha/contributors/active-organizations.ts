// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import type { TinybirdQuery } from '@lfx-insights/tinybird-client';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  getPreviousDates,
  hasBucketBounds,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
} from '../../../lib/period.js';
import {
  ContributionFlags,
  periodSummary,
  ProjectSlugParams,
  SeriesQuery,
} from '../../../schemas/common.js';

const pipePath = '/v0/pipes/active_organizations.json';

interface SummaryRow {
  organizationCount: number;
}

interface SeriesRow {
  startDate: string | null;
  endDate: string | null;
  organizationCount?: number | null;
}

const ActiveOrganizationsQuery = Type.Object({
  ...SeriesQuery.properties,
  ...ContributionFlags.properties,
});

const ActiveOrganizationsBucket = Type.Object({
  startDate: Type.String({
    format: 'date-time',
    description: 'First day of the bucket, at 00:00:00 UTC.',
  }),
  endDate: Type.String({
    format: 'date-time',
    description: 'Last calendar day of the bucket, at 00:00:00 UTC.',
  }),
  organizations: Type.Integer({ description: 'Active organizations in the bucket (count).' }),
});

const ActiveOrganizationsSummary = periodSummary({
  measure: 'Active organizations',
  unit: 'count',
  kind: 'integer',
  title: 'ActiveOrganizationsSummary',
  description:
    'Active organizations in the current period against the comparison period, each organization counted once per period.',
});

const ActiveOrganizations = Type.Object({
  summary: ActiveOrganizationsSummary,
  data: Type.Array(ActiveOrganizationsBucket, {
    description:
      'One entry per granularity bucket in the current period, ascending by `startDate`. The first and last buckets keep their full calendar bounds but count only activity inside the period. A bucket the pipe reports without both bounds is omitted.',
  }),
});

const activeOrganizationsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/contributors/active-organizations',
    {
      schema: {
        tags: ['Contributors'],
        summary: 'Get active organizations',
        description:
          'Returns the number of active organizations in the period against the comparison period before it, and the number of active organizations per bucket. An organization is active when at least one activity attributed to it falls in the period and is of a kind the flags select: code contributions unless `includeCodeContributions` is false, and collaborations when `includeCollaborations` is true. `summary` counts each organization once for the whole period, while each bucket counts the organizations active in it, so the buckets can add up to more than `summary.current`. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. An unknown project returns zeros and an empty `data` list.',
        params: ProjectSlugParams,
        querystring: ActiveOrganizationsQuery,
        response: { 200: ActiveOrganizations },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const {
        repos,
        startDate,
        endDate,
        granularity,
        includeCodeContributions = true,
        includeCollaborations = false,
      } = request.query;
      const dates = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        const shared: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          includeCodeContributions,
          includeCollaborations,
        };
        const currentRange = toTinybirdRange(dates.current);

        return Promise.all([
          fetchPipe<SummaryRow>(request, pipePath, { ...shared, ...currentRange }),
          fetchPipe<SummaryRow>(request, pipePath, {
            ...shared,
            ...toTinybirdRange(dates.previous),
          }),
          fetchPipe<SeriesRow>(request, pipePath, { ...shared, ...currentRange, granularity }),
        ]);
      });
      if (!rows) {
        return { summary: toPeriodSummary(0, 0, dates.current), data: [] };
      }

      const [currentRows, previousRows, seriesRows] = rows;
      const current = currentRows[0];
      const previous = previousRows[0];
      return {
        summary: toPeriodSummary(
          current?.organizationCount ?? 0,
          previous?.organizationCount ?? 0,
          dates.current,
        ),
        data: seriesRows.filter(hasBucketBounds).map((row) => ({
          startDate: toIsoUtc(row.startDate),
          endDate: toIsoUtc(row.endDate),
          organizations: row.organizationCount ?? 0,
        })),
      };
    },
  );
};

export default activeOrganizationsRoutes;
