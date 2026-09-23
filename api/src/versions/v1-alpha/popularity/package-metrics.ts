// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import {
  hasBucketBounds,
  resolvePeriods,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
  type DateRange,
} from '../../../lib/period.js';
import { periodSummary, ProjectSlugParams, SeriesQuery } from '../../../schemas/common.js';

const pipePath = '/v0/pipes/package_metrics.json';

const metrics = {
  downloads: {
    column: 'downloadsCount',
    measure: 'Package downloads',
    peak: 'Highest running download total of one package',
  },
  dockerDownloads: {
    column: 'dockerDownloadsCount',
    measure: 'Docker image downloads',
    peak: 'Highest running Docker image download total of one package',
  },
  dockerDependents: {
    column: 'dockerDependentsCount',
    measure: 'Docker images using the package',
    peak: 'Most Docker images using one package on a single day',
  },
  dependentPackages: {
    column: 'dependentPackagesCount',
    measure: 'Packages depending on it',
    peak: 'Most packages depending on one package on a single day',
  },
  dependentRepos: {
    column: 'dependentReposCount',
    measure: 'Repositories depending on it',
    peak: 'Most repositories depending on one package on a single day',
  },
} as const;

type Metric = keyof typeof metrics;
type MetricRow = Partial<Record<(typeof metrics)[Metric]['column'], number>>;
type SeriesRow = MetricRow & { startDate: string; endDate: string };

const metricNames = Object.keys(metrics) as Metric[];

const isMetricRow = (row: MetricRow) =>
  typeof row === 'object' &&
  row !== null &&
  metricNames.every((metric) => {
    const value = row[metrics[metric].column];
    return value === undefined || typeof value === 'number';
  });

const Query = Type.Object({
  ...SeriesQuery.properties,
  startDate: Type.Optional(
    Type.String({
      format: 'date',
      description:
        'Start of the period, as a UTC calendar day (YYYY-MM-DD). Exclusive: records dated on this day are left out, so the period covers the days after it. The earliest accepted day is 2000-01-01.',
    }),
  ),
  ecosystem: Type.Optional(
    Type.String({
      description:
        'Package ecosystem, such as `npm` or `pypi`, as the packages endpoint lists it. Without it every ecosystem counts.',
    }),
  ),
  name: Type.Optional(
    Type.String({
      description:
        'Package name, as the packages endpoint lists it. Without it every package of the project counts.',
    }),
  ),
});

const PackageMetrics = Type.Object({
  summary: Type.Object(
    Object.fromEntries(
      metricNames.map((metric) => [
        metric,
        periodSummary({ measure: metrics[metric].peak, unit: 'count', kind: 'integer' }),
      ]),
    ) as Record<Metric, ReturnType<typeof periodSummary>>,
    {
      description:
        'One period summary per metric: the highest value any one matching package reported on a single day of the period.',
    },
  ),
  data: Type.Array(
    Type.Object({
      startDate: Type.String({ format: 'date-time', description: 'Start of the bucket, UTC.' }),
      endDate: Type.String({ format: 'date-time', description: 'End of the bucket, UTC.' }),
      ...(Object.fromEntries(
        metricNames.map((metric) => [
          metric,
          Type.Integer({
            description: `${metrics[metric].measure}: the highest daily total across the matching packages in the bucket (count).`,
          }),
        ]),
      ) as Record<Metric, ReturnType<typeof Type.Integer>>),
    }),
    { description: 'One row per time bucket of the requested granularity.' },
  ),
});

const summarize = (current: MetricRow = {}, previous: MetricRow = {}, range: DateRange) =>
  Object.fromEntries(
    metricNames.map((metric) => {
      const { column } = metrics[metric];
      return [metric, toPeriodSummary(current[column] ?? 0, previous[column] ?? 0, range)];
    }),
  ) as Record<Metric, ReturnType<typeof toPeriodSummary>>;

const toBucket = (row: SeriesRow & DateRange) => ({
  startDate: toIsoUtc(row.startDate),
  endDate: toIsoUtc(row.endDate),
  downloads: row.downloadsCount ?? 0,
  dockerDownloads: row.dockerDownloadsCount ?? 0,
  dockerDependents: row.dockerDependentsCount ?? 0,
  dependentPackages: row.dependentPackagesCount ?? 0,
  dependentRepos: row.dependentReposCount ?? 0,
});

const packageMetricsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/popularity/package-metrics',
    {
      schema: {
        tags: ['Popularity'],
        summary: 'Get package metrics',
        description:
          'Returns the downloads, Docker image downloads, Docker dependents, dependent packages and dependent repositories of the project packages, as a summary comparing the current period with the comparison period before it, plus one row per time bucket of the requested granularity. Pass `ecosystem` and `name` from the packages endpoint to read one package; without them every package of the project counts. Each daily record holds running totals: downloads and Docker downloads up to that day, and the dependents counted on that day. So the summary and the buckets take the highest value in their range rather than a sum. The summary takes the highest value any one matching package reported on a single day, while each bucket first adds up the matching packages per day and then takes the highest daily total. Records dated on `startDate` are left out: the period covers the days after `startDate` and before `endDate`. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. An unknown project returns zero counts and an empty `data` list.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: PackageMetrics },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, granularity, ecosystem, name } = request.query;
      const { current, previous } = resolvePeriods(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        const common = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          ecosystem: ecosystem || undefined,
          name: name || undefined,
        };
        const currentRange = toTinybirdRange(current);
        return Promise.all([
          fetchPipe<MetricRow>(request, pipePath, { ...common, ...currentRange }, isMetricRow),
          fetchPipe<MetricRow>(
            request,
            pipePath,
            { ...common, ...toTinybirdRange(previous) },
            isMetricRow,
          ),
          fetchPipe<SeriesRow>(
            request,
            pipePath,
            { ...common, ...currentRange, granularity },
            hasBucketBounds,
          ),
        ]);
      });
      if (!rows) {
        return { summary: summarize(undefined, undefined, current), data: [] };
      }

      const [currentRows, previousRows, seriesRows] = rows;
      return {
        summary: summarize(currentRows[0], previousRows[0], current),
        data: seriesRows.map(toBucket),
      };
    },
  );
};

export default packageMetricsRoutes;
