// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import { ActivityPlatforms, ActivityTypes } from '@lfx-insights/types';

import { fetchActivityCounts } from '../../../lib/activity-count.js';
import { widgetRoutes } from '../../../lib/widget-scope.js';
import {
  CollectionSeriesQuery,
  countType,
  periodSummary,
  SeriesQuery,
} from '../../../schemas/common.js';

const MailingListsMessagesQuery = Type.Object({
  ...SeriesQuery.properties,
  countType: countType('the messages sent'),
});

const CollectionMailingListsMessagesQuery = Type.Object({
  ...CollectionSeriesQuery.properties,
  countType: MailingListsMessagesQuery.properties.countType,
});

const MessagesSummary = periodSummary({
  measure: 'Messages sent',
  unit: 'count',
  kind: 'integer',
  description:
    'Messages sent in the current period against the previous one. It counts new messages even when countType=cumulative.',
});

const MailingListsMessages = Type.Object({
  summary: MessagesSummary,
  data: Type.Array(
    Type.Object({
      startDate: Type.String({ format: 'date-time', description: 'Start of the bucket, UTC.' }),
      endDate: Type.String({ format: 'date-time', description: 'End of the bucket, UTC.' }),
      messages: Type.Integer({
        description:
          'Messages sent in the bucket, or the running total up to its end when countType=cumulative (count).',
      }),
    }),
    { description: 'One row per time bucket of the requested granularity.' },
  ),
});

const counting =
  'Only groups.io messages are counted. The comparison period ends the day before `startDate`; its span is derived in calendar months and days, so its elapsed days can differ. Without dates the period runs from 2010-01-01 to today. The period runs from 00:00 UTC on `startDate` up to, and excluding, 00:00 UTC on `endDate`.';

const mailingListsMessagesRoutes: FastifyPluginAsyncTypebox = async (scope) => {
  widgetRoutes(scope, {
    path: 'popularity/mailing-lists-messages',
    tags: ['Popularity'],
    summary: 'Get mailing list messages',
    project: {
      description:
        'Returns the messages sent to the project groups.io mailing lists per time bucket of the requested granularity, as new messages in each bucket or as a cumulative total, plus a summary comparing the messages sent in the current period with the comparison period before it. ' +
        counting +
        ' An unknown project returns zero counts and an empty `data` list.',
      querystring: MailingListsMessagesQuery,
      response: MailingListsMessages,
    },
    collection: {
      description:
        "Returns the messages sent to the groups.io mailing lists of the collection's projects per time bucket of the requested granularity, as new messages in each bucket or as a cumulative total, plus a summary comparing the messages sent in the current period with the comparison period before it. " +
        counting,
      querystring: CollectionMailingListsMessagesQuery,
      response: MailingListsMessages,
    },
    handler: async (request, withTarget) => {
      // Mirrors the widget, which leaves includeOtherContributions unset for messages.
      const { summary, data } = await fetchActivityCounts(request, withTarget, request.query, {
        activity_type: ActivityTypes.MESSAGE,
        platform: ActivityPlatforms.GROUPS_IO,
        onlyContributions: false,
        includeCodeContributions: true,
        includeCollaborations: true,
      });
      return {
        summary,
        data: data.map(({ count, ...bucket }) => ({ ...bucket, messages: count })),
      };
    },
  });
};

export default mailingListsMessagesRoutes;
