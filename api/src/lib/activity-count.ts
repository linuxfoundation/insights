// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Static } from '@sinclair/typebox';

import type { TinybirdQuery } from '@lfx-insights/tinybird-client';

import { fetchPipe, repoFilter, withBucket, type RequestLog } from '../clients/tinybird.js';
import type { Granularity, PeriodSummary } from '../schemas/common.js';
import {
  getPreviousDates,
  hasBucketBounds,
  toIsoUtc,
  toPeriodSummary,
  toTinybirdRange,
} from './period.js';

interface SummaryRow {
  activityCount?: number;
}

interface SeriesRow {
  startDate: string;
  endDate: string;
  activityCount?: number;
  cumulativeActivityCount?: number;
}

const activitiesCountPath = '/v0/pipes/activities_count.json';

export interface ActivityCountQuery {
  repos?: string[];
  startDate?: string;
  endDate?: string;
  granularity: Static<typeof Granularity>;
  countType?: 'new' | 'cumulative';
}

interface ActivityCountResult {
  summary: PeriodSummary;
  data: { startDate: string; endDate: string; count: number }[];
}

// project, bucketId and repos override same-named keys in pipeParams, so a caller cannot widen the scope.
export async function fetchActivityCounts(
  request: RequestLog,
  slug: string,
  query: ActivityCountQuery,
  pipeParams: TinybirdQuery,
): Promise<ActivityCountResult> {
  const { repos, startDate, endDate, granularity, countType = 'new' } = query;
  const { current, previous } = getPreviousDates(startDate, endDate);
  const isCumulative = countType === 'cumulative';

  const rows = await withBucket(request, slug, (bucketId) => {
    const common = { ...pipeParams, project: slug, bucketId, repos: repoFilter(repos) };
    const currentRange = toTinybirdRange(current);
    const seriesPipe = isCumulative ? 'activities_cumulative_count' : 'activities_count';

    return Promise.all([
      fetchPipe<SummaryRow>(request, activitiesCountPath, { ...common, ...currentRange }),
      fetchPipe<SummaryRow>(request, activitiesCountPath, {
        ...common,
        ...toTinybirdRange(previous),
      }),
      fetchPipe<SeriesRow>(
        request,
        `/v0/pipes/${seriesPipe}.json`,
        { ...common, ...currentRange, granularity },
        hasBucketBounds,
      ),
    ]);
  });
  if (!rows) {
    return { summary: toPeriodSummary(0, 0, current), data: [] };
  }

  const [currentRows, previousRows, seriesRows] = rows;
  return {
    summary: toPeriodSummary(
      currentRows[0]?.activityCount ?? 0,
      previousRows[0]?.activityCount ?? 0,
      current,
    ),
    data: seriesRows.map((row) => ({
      startDate: toIsoUtc(row.startDate),
      endDate: toIsoUtc(row.endDate),
      count: (isCumulative ? row.cumulativeActivityCount : row.activityCount) ?? 0,
    })),
  };
}
