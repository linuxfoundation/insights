// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type, type Static } from '@sinclair/typebox';

import { fetchPipe, repoFilter, withBucket } from '../../clients/tinybird.js';
import { ContributionFlags, DateRangeQuery, ProjectSlugParams } from '../../schemas/common.js';

const pipePath = '/v0/pipes/activityTypes_by_project.json';

interface Row {
  platform: string;
  activityType: string;
  label: string;
}

const isRow = (row: Row) =>
  typeof row.platform === 'string' &&
  typeof row.activityType === 'string' &&
  typeof row.label === 'string';

// Compares character codes, the order the pipe sorts keys in, where localeCompare would put `_`
// before `-`.
const compareCharCodes = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const compareRows = (a: Row, b: Row) =>
  compareCharCodes(a.platform, b.platform) ||
  compareCharCodes(a.activityType, b.activityType) ||
  compareCharCodes(a.label, b.label);

const Query = Type.Object({
  repos: DateRangeQuery.properties.repos,
  ...ContributionFlags.properties,
  includeOtherContributions: Type.Optional(
    Type.Boolean({
      default: false,
      description:
        'Count other activity, which is neither a code contribution nor a collaboration, such as stars and forks.',
    }),
  ),
});

const ActivityTypeEntry = Type.Object({
  key: Type.String({
    description: 'Activity type key. Pass it as `activityType` on the Contributors endpoints.',
  }),
  label: Type.String({
    description: 'Display name of the activity type, as the Insights UI shows it.',
  }),
});

const PlatformActivityTypes = Type.Object({
  platform: Type.String({
    description:
      'Platform the activity types were recorded on, such as `github` or `gerrit`. Pass it as `platform` on the Contributors endpoints.',
  }),
  activityTypes: Type.Array(ActivityTypeEntry, {
    description:
      'Activity types on this platform with activity in the project, sorted by `key`, each key once.',
  }),
});

const ActivityTypesByPlatform = Type.Object({
  data: Type.Array(PlatformActivityTypes, {
    description:
      'One entry per platform with activity in the project, sorted by `platform`. Empty for an unknown project.',
  }),
});

const activityTypeRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  scope.get(
    '/projects/:slug/activity-types',
    {
      schema: {
        tags: ['Projects'],
        summary: 'List activity types',
        description:
          "Returns the activity types the project has activity of, at any time, grouped by platform, each with the label the Insights UI shows. To count one of them on the Contributors endpoints, pass its `platform` as `platform` and its `key` as `activityType`, with the same `includeCodeContributions` and `includeCollaborations` values; a key can appear under more than one platform. The flags choose which kinds of type are listed: code contributions by default, collaborations with `includeCollaborations`, and other activity, such as stars and forks, with `includeOtherContributions`. The Contributors endpoints count only the first two kinds. With all three off, `data` is empty. Platforms are sorted by `platform` and each platform's types by `key`, comparing character codes, so `patchset-created` sorts before `patchset_approval-created`. The whole list comes in one response. An unknown project returns an empty `data` list.",
        params: ProjectSlugParams,
        querystring: Query,
        response: { 200: ActivityTypesByPlatform },
      },
    },
    async (request) => {
      const { slug } = request.params;
      const { repos, includeCodeContributions, includeCollaborations, includeOtherContributions } =
        request.query;

      const rows = await withBucket(request, slug, (bucketId) =>
        fetchPipe<Row>(
          request,
          pipePath,
          {
            project: slug,
            bucketId,
            repos: repoFilter(repos),
            includeCodeContributions,
            includeCollaborations,
            includeOtherContributions,
          },
          isRow,
        ),
      );
      if (!rows) {
        return { data: [] };
      }

      // The pipe joins the `activityTypes` datasource, a ReplacingMergeTree, without FINAL, so a
      // relabelled type can arrive twice until ClickHouse merges it. Keeping the first label in
      // sort order makes the answer deterministic.
      const data: Static<typeof PlatformActivityTypes>[] = [];
      for (const { platform, activityType: key, label } of rows.sort(compareRows)) {
        const group = data.at(-1);
        if (group?.platform !== platform) {
          data.push({ platform, activityTypes: [{ key, label }] });
        } else if (group.activityTypes.at(-1)?.key !== key) {
          group.activityTypes.push({ key, label });
        }
      }
      return { data };
    },
  );
};

export default activityTypeRoutes;
