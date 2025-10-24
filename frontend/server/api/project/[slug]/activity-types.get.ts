// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createDataSource } from '~~/server/data/data-sources';
import type { ActivityTypesFilter } from '~~/types/development/requests.types';
import { getBooleanQueryParam } from '~~/server/utils/common';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const project = (event.context.params as { slug: string }).slug;

  const filter: ActivityTypesFilter = {
    project,
    repos: query?.repos
      ? Array.isArray(query.repos)
        ? (query.repos as string[])
        : [query.repos as string]
      : undefined,
    includeCodeContributions: getBooleanQueryParam(query, 'includeCodeContributions', true),
    includeCollaborations: getBooleanQueryParam(query, 'includeCollaborations', false),
    includeOtherContributions: getBooleanQueryParam(query, 'includeOtherContributions', false),
  };

  const dataSource = createDataSource();

  return await dataSource.fetchActivityTypes(filter);
});
