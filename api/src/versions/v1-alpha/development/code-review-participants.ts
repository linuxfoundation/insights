// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { TinybirdQuery } from '@lfx-insights/tinybird-client';
import { Type } from '@sinclair/typebox';
import { ActivityTypes } from '@lfx-insights/types';
import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { getPreviousDates, toPeriodSummary, toTinybirdRange } from '../../../lib/period.js';
import { DateRangeQuery, periodSummary, ProjectSlugParams } from '../../../schemas/common.js';

const activeContributorsPath = '/v0/pipes/active_contributors.json';
const leaderboardPath = '/v0/pipes/contributors_leaderboard.json';

const participantActivityTypes = [
  ActivityTypes.PULL_REQUEST_REVIEWED,
  ActivityTypes.PULL_REQUEST_ASSIGNED,
  ActivityTypes.PULL_REQUEST_COMMENT,
  ActivityTypes.PULL_REQUEST_REVIEW_THREAD_COMMENT,
  ActivityTypes.PULL_REQUEST_OPENED,
  ActivityTypes.PULL_REQUEST_REVIEW_REQUESTED,
  ActivityTypes.MERGE_REQUEST_REVIEW_CHANGES_REQUESTED,
  ActivityTypes.MERGE_REQUEST_REVIEW_APPROVED,
  ActivityTypes.MERGE_REQUEST_ASSIGNED,
  ActivityTypes.MERGE_REQUEST_COMMENT,
  ActivityTypes.MERGE_REQUEST_REVIEW_REQUESTED,
  ActivityTypes.MERGE_REQUEST_OPENED,
  ActivityTypes.CHANGESET_CREATED,
  ActivityTypes.CHANGESET_COMMENT_CREATED,
  ActivityTypes.PATCHSET_COMMENT_CREATED,
  ActivityTypes.PATCHSET_APPROVAL_CREATED,
];

interface SummaryRow {
  contributorCount?: number;
}

interface ParticipantRow {
  avatar: string;
  displayName: string;
  contributionCount?: number;
  contributionPercentage?: number;
}

const isOptionalInteger = (value: unknown) => value === undefined || Number.isInteger(value);
const isOptionalNumber = (value: unknown) => value === undefined || typeof value === 'number';
const isSummaryRow = (row: SummaryRow) => isOptionalInteger(row.contributorCount);
const isParticipantRow = (row: ParticipantRow) =>
  typeof row.displayName === 'string' &&
  typeof row.avatar === 'string' &&
  isOptionalInteger(row.contributionCount) &&
  isOptionalNumber(row.contributionPercentage);

const Query = Type.Object({
  ...DateRangeQuery.properties,
  limit: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 50,
      default: 5,
      description: 'Maximum number of participants to return in `data`, from 1 to 50.',
    }),
  ),
});

const ParticipantsSummary = periodSummary({
  measure: 'Review participants',
  unit: 'count of contributors',
  kind: 'integer',
  title: 'CodeReviewParticipantsSummary',
  description:
    'Contributors with at least one code review activity attributed to them in the current period, against the comparison period before it.',
});

const Participant = Type.Object({
  name: Type.String({ description: "The participant's display name." }),
  avatar: Type.String({ description: "URL of the participant's avatar image." }),
  activityCount: Type.Integer({
    description:
      'Code review activities attributed to the participant in the current period (count).',
  }),
  activityPercentage: Type.Number({
    description:
      "Share of the current period's code review activities attributed to the participant, in percent.",
  }),
});

const CodeReviewParticipants = Type.Object({
  summary: ParticipantsSummary,
  data: Type.Array(Participant, {
    description:
      'Up to `limit` participants with the most code review activity in the current period, most active first. An unknown project gets an empty list.',
  }),
});

const codeReviewParticipantsRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/development/code-review-participants',
    {
      schema: {
        tags: ['Development'],
        summary: 'Get code review participants',
        description:
          'Returns the number of contributors who took part in code review in the period against the comparison period before it, and the participants with the most review activity. A participant is a contributor with at least one review activity attributed to them. On GitHub and GitLab that is opening a pull or merge request, being assigned to it or asked to review it, reviewing it (including approving it or requesting changes), or commenting on it. On Gerrit it is creating a changeset, commenting on a changeset or patchset, or approving a patchset. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`. An unknown project returns zero counts and an empty `data` list. Participant identity fields are provisional in /v1-alpha.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: CodeReviewParticipants },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, startDate, endDate, limit = 5 } = request.query;
      const dates = getPreviousDates(startDate, endDate);

      const rows = await withBucket(request, slug, (bucketId) => {
        const shared: TinybirdQuery = {
          project: slug,
          bucketId,
          repos: repoFilter(repos),
          activity_types: participantActivityTypes,
        };
        const currentRange = toTinybirdRange(dates.current);

        return Promise.all([
          fetchPipe<SummaryRow>(
            request,
            activeContributorsPath,
            { ...shared, ...currentRange },
            isSummaryRow,
          ),
          fetchPipe<SummaryRow>(
            request,
            activeContributorsPath,
            { ...shared, ...toTinybirdRange(dates.previous) },
            isSummaryRow,
          ),
          fetchPipe<ParticipantRow>(
            request,
            leaderboardPath,
            { ...shared, ...currentRange, limit },
            isParticipantRow,
          ),
        ]);
      });
      if (!rows) {
        return { summary: toPeriodSummary(0, 0, dates.current), data: [] };
      }

      const [currentRows, previousRows, participantRows] = rows;
      return {
        summary: toPeriodSummary(
          currentRows[0]?.contributorCount ?? 0,
          previousRows[0]?.contributorCount ?? 0,
          dates.current,
        ),
        data: participantRows.map((row) => ({
          name: row.displayName,
          avatar: row.avatar,
          activityCount: row.contributionCount ?? 0,
          activityPercentage: row.contributionPercentage ?? 0,
        })),
      };
    },
  );
};

export default codeReviewParticipantsRoutes;
