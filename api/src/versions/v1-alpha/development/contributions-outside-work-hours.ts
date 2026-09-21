// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { TinybirdProjectNotFoundError, type TinybirdQuery } from '@lfx-insights/tinybird-client';
import { Type } from '@sinclair/typebox';
import type { FastifyRequest } from 'fastify';
import { getTinybirdClient } from '../../../clients/tinybird.js';
import { UpstreamUnavailableError } from '../../../lib/errors.js';
import { getPreviousDates, toPeriodSummary, type DateRange } from '../../../lib/period.js';
import { DateRangeQuery, PeriodSummary, ProjectSlugParams } from '../../../schemas/common.js';

// weekday is ISO (1 = Monday to 7 = Sunday) and twoHoursBlock the block's start hour, both in
// the contributor's local time as computed by the pipe.
interface HeatmapRow {
  weekday: number;
  twoHoursBlock: number;
  activityCount: number;
}

const pipePath = '/v0/pipes/activity_heatmap_by_weekday_and_2hours_blocks.json';

const Query = Type.Object({
  ...DateRangeQuery.properties,
  includeCollaborations: Type.Optional(
    Type.Boolean({
      default: false,
      description: 'Count collaboration activities such as reviews and comments as contributions.',
    }),
  ),
  includeCodeContributions: Type.Optional(
    Type.Boolean({
      default: true,
      description: 'Count code contributions such as commits, pull requests and patchsets.',
    }),
  ),
});

// The shared PeriodSummary describes counts; here the values are percents, so the three
// unit-less fields get their own descriptions.
const OutsideWorkHoursSummary = Type.Object(
  {
    ...PeriodSummary.properties,
    current: Type.Number({
      description:
        'Share of contributions made outside work hours in the current period, in percent.',
    }),
    previous: Type.Number({
      description:
        'Share of contributions made outside work hours in the previous period, in percent.',
    }),
    changeValue: Type.Number({
      description: 'Current share minus previous share, in percentage points.',
    }),
  },
  {
    title: 'OutsideWorkHoursSummary',
    description:
      'Share of contributions made outside work hours, in percent, for the current period and the previous period of the same length.',
  },
);

const HeatmapCell = Type.Object({
  weekday: Type.Integer({
    description:
      "Day of the week in the contributor's local time, ISO 8601 numbering: 1 = Monday to 7 = Sunday.",
  }),
  hour: Type.Integer({
    description:
      "Start hour of the 2-hour block in the contributor's local time: 0, 2, 4 and so on up to 22. The block covers this hour and the next.",
  }),
  contributions: Type.Integer({
    description: 'Number of contributions in the block (count).',
  }),
});

const ContributionsOutsideWorkHours = Type.Object({
  summary: OutsideWorkHoursSummary,
  weekdayOutsideHoursPercentage: Type.Number({
    description:
      "Share of the current period's contributions made Monday to Friday between 18:00 and 08:00, in percent.",
  }),
  weekendOutsideHoursPercentage: Type.Number({
    description:
      "Share of the current period's contributions made on Saturday or Sunday, in percent.",
  }),
  data: Type.Array(HeatmapCell, {
    description:
      'Heatmap of the current period: one cell per weekday and 2-hour block, ordered by weekday then hour. Empty when the project has no contributions in the period.',
  }),
});

// Same datetime form the Nuxt data layer sends (Luxon's yyyy-MM-dd 00:00:00).
const toTinybirdDateTime = (day: string) => `${day} 00:00:00`;
const tinybirdRange = (range: DateRange) => ({
  startDate: toTinybirdDateTime(range.startDate),
  endDate: toTinybirdDateTime(range.endDate),
});

const isWeekend = (row: HeatmapRow) => row.weekday >= 6;
const isWeekdayOutsideWorkHours = (row: HeatmapRow) =>
  row.weekday <= 5 && (row.twoHoursBlock >= 18 || row.twoHoursBlock < 8);
const sum = (rows: HeatmapRow[]) => rows.reduce((total, row) => total + row.activityCount, 0);
// A period with no contributions has a zero share, as the Nuxt widget reports.
const share = (part: number, total: number) => (total === 0 ? 0 : (part / total) * 100);

async function fetchHeatmap(request: FastifyRequest, params: TinybirdQuery): Promise<HeatmapRow[]> {
  const client = getTinybirdClient();
  try {
    const { data } = await client.fetch<HeatmapRow[]>(pipePath, params);
    return data;
  } catch (err: unknown) {
    // The client's bucket lookup has no row for an unknown slug; a metric endpoint answers that
    // with empty data rather than 404.
    if (err instanceof TinybirdProjectNotFoundError) {
      return [];
    }
    request.log.error({ err }, `Tinybird ${pipePath} request failed`);
    throw new UpstreamUnavailableError();
  }
}

const contributionsOutsideWorkHoursRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/contributions-outside-work-hours',
    {
      schema: {
        tags: ['Development'],
        summary: 'Contributions outside work hours',
        description:
          'Returns the heatmap of contributions by weekday and 2-hour block for the current period, the share of contributions made outside work hours for the current and the previous period, and that share split into weekdays and weekends. ' +
          'Outside work hours means Monday to Friday from 18:00 to 08:00, plus all of Saturday and Sunday. ' +
          "Weekdays and hours are in each contributor's local time: the activity timestamp is shifted by an offset derived from the contributor's profile country or location, and contributors without a mappable location are left out. " +
          '`startDate` and `endDate` filter on the original UTC timestamps. Counts cover git, GitHub, GitLab and Gerrit activity, and the underlying dataset is rebuilt once a day. ' +
          'An unknown project returns zero shares and an empty heatmap.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: ContributionsOutsideWorkHours },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, includeCollaborations, includeCodeContributions } =
        request.query;
      const dates = getPreviousDates(startDate, endDate);
      const filter = { project: slug, repos, includeCodeContributions, includeCollaborations };
      const [current, previous] = await Promise.all([
        fetchHeatmap(request, { ...filter, ...tinybirdRange(dates.current) }),
        fetchHeatmap(request, { ...filter, ...tinybirdRange(dates.previous) }),
      ]);

      const total = sum(current);
      const weekdayOutside = sum(current.filter(isWeekdayOutsideWorkHours));
      const weekend = sum(current.filter(isWeekend));
      const previousShare = share(
        sum(previous.filter(isWeekdayOutsideWorkHours)) + sum(previous.filter(isWeekend)),
        sum(previous),
      );

      return {
        summary: toPeriodSummary(
          share(weekdayOutside + weekend, total),
          previousShare,
          dates.current,
        ),
        weekdayOutsideHoursPercentage: share(weekdayOutside, total),
        weekendOutsideHoursPercentage: share(weekend, total),
        data: current.map((row) => ({
          weekday: row.weekday,
          hour: row.twoHoursBlock,
          contributions: row.activityCount,
        })),
      };
    },
  );
};

export default contributionsOutsideWorkHoursRoutes;
