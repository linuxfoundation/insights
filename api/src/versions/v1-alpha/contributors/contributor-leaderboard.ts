// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../../clients/tinybird.js';
import { pipeWindow, requestedPage, toPage } from '../../../lib/pagination.js';
import { getPreviousDates, toTinybirdRange } from '../../../lib/period.js';
import {
  ActivityPlatform,
  ActivityType,
  ContributionFlags,
  DateRangeQuery,
  paginated,
  PaginationQuery,
  ProjectSlugParams,
} from '../../../schemas/common.js';

const pipePath = '/v0/pipes/contributors_leaderboard.json';

interface ContributorRow {
  id: string;
  displayName: string;
  avatar: string;
  contributionCount: number;
  contributionPercentage: number;
  roles?: string[] | null;
  githubHandleArray?: string[] | null;
}

const isOptionalStringList = (value: unknown) =>
  value === undefined ||
  value === null ||
  (Array.isArray(value) && value.every((entry) => typeof entry === 'string'));

const isContributorRow = (row: ContributorRow) =>
  typeof row.id === 'string' &&
  typeof row.displayName === 'string' &&
  typeof row.avatar === 'string' &&
  Number.isSafeInteger(row.contributionCount) &&
  typeof row.contributionPercentage === 'number' &&
  isOptionalStringList(row.roles) &&
  isOptionalStringList(row.githubHandleArray);

// The pipe pages by count, then member id, both descending, but its final node re-sorts by count
// alone. Member ids are ASCII UUIDs in a String column, so ClickHouse compares bytes, as `<` does.
const inPipeOrder = (a: ContributorRow, b: ContributorRow) =>
  b.contributionCount - a.contributionCount || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0);

const toContributor = (row: ContributorRow) => ({
  name: row.displayName,
  avatar: row.avatar,
  contributions: row.contributionCount,
  contributionPercentage: row.contributionPercentage,
  roles: row.roles ?? [],
  githubHandles: row.githubHandleArray ?? [],
});

const Query = Type.Object({
  ...DateRangeQuery.properties,
  platform: Type.Optional(ActivityPlatform),
  activityType: Type.Optional(ActivityType),
  ...ContributionFlags.properties,
  ...PaginationQuery.properties,
});

const Contributor = Type.Object({
  name: Type.String({
    description:
      "The contributor's display name. For a project outside the Linux Foundation, their username instead: the one from their GitHub activity, else git, else another platform.",
  }),
  avatar: Type.String({
    description: "URL of the contributor's avatar image. An empty string when they have none.",
  }),
  contributions: Type.Integer({
    description: 'Contributions by the contributor in the period that match the filters (count).',
  }),
  contributionPercentage: Type.Number({
    description:
      "The contributor's share of all contributions in the period that match the filters, in percent, rounded to two decimals.",
  }),
  roles: Type.Array(Type.String(), {
    description:
      "Roles the contributor holds in the project's repositories, or only in `repos` when given: `maintainer` or `contributor`, as read from files such as MAINTAINERS, CODEOWNERS and CONTRIBUTORS. A role counts whatever the period, including one that has ended. Empty when they hold none.",
  }),
  githubHandles: Type.Array(Type.String(), {
    description: "The contributor's verified GitHub usernames. Empty when they have none.",
  }),
});

const ContributorLeaderboard = paginated(Contributor, {
  data: 'Up to `pageSize` contributors, ranked by contributions, most first. An unknown project gets an empty list.',
});

const contributorLeaderboardRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/contributors/contributor-leaderboard',
    {
      schema: {
        tags: ['Contributors'],
        summary: 'Get the contributor leaderboard',
        description:
          "Returns the project's contributors ranked by their contributions in the period, most first, with each one's contribution count and share, one page at a time. " +
          'Contributors with the same count are ordered by an internal contributor ID, so tied contributors keep their order from one page to the next. ' +
          'Pages follow rank position, as the Pagination guide describes: a contributor whose rank changes between your requests can be skipped or repeated. ' +
          'The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`; without dates it runs from 2010-01-01 to today. ' +
          'An unknown project returns an empty `data` list. Contributor identity fields are provisional in /v1-alpha.',
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: ContributorLeaderboard },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const {
        repos,
        startDate,
        endDate,
        platform,
        activityType,
        includeCodeContributions,
        includeCollaborations,
      } = request.query;
      // No comparison period: this only fills the default range and rejects an inverted one.
      const { current } = getPreviousDates(startDate, endDate);
      const page = requestedPage(request.query);

      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe<ContributorRow>(
          request,
          pipePath,
          {
            project: slug,
            bucketId,
            repos: repoFilter(repos),
            ...toTinybirdRange(current),
            platform,
            activity_type: activityType,
            includeCodeContributions,
            includeCollaborations,
            ...pipeWindow(page),
          },
          isContributorRow,
        ),
      );
      return toPage((rows ?? []).sort(inPipeOrder).map(toContributor), page);
    },
  );
};

export default contributorLeaderboardRoutes;
