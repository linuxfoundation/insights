// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from "~~/server/data/tinybird/tinybird";
import type { ActivityTypesFilter } from "~~/types/development/requests.types";
import type { ActivityTypesByPlatformResponse } from "~~/types/development/responses.types";
import type { ActivityTypesTinybirdQuery } from "~~/server/data/tinybird/requests.types";
import type { TinybirdActivityTypesResponse } from "~~/server/data/tinybird/responses.types";

export async function fetchActivityTypes(filter: ActivityTypesFilter): Promise<ActivityTypesByPlatformResponse> {
  const query: ActivityTypesTinybirdQuery = {
    project: filter.project,
    repos: filter.repos,
    includeCodeContributions: filter.includeCodeContributions,
    includeCollaborations: filter.includeCollaborations,
    includeOtherContributions: filter.includeOtherContributions,
  };

  const response = await fetchFromTinybird<TinybirdActivityTypesResponse>(
    '/v0/pipes/activityTypes_by_project.json',
    query
  );

  const activityTypesByPlatform: ActivityTypesByPlatformResponse = {};

  for (const item of response.data) {
    if (!activityTypesByPlatform[item.platform]) {
      activityTypesByPlatform[item.platform] = [];
    }

    activityTypesByPlatform[item.platform].push({
      key: item.activityType,
      label: item.label,
    });
  }

  return activityTypesByPlatform;
}
