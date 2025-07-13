// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {ActivityTypesFilter} from "~~/types/development/requests.types";
import type {ActivityTypesResponse} from "~~/types/development/responses.types";
import type {ActivityTypesTinybirdQuery} from "~~/server/data/tinybird/requests.types";
import type {TinybirdActivityTypesResponse} from "~~/server/data/tinybird/responses.types";

export async function fetchActivityTypes(filter: ActivityTypesFilter): Promise<ActivityTypesResponse> {
  const query: ActivityTypesTinybirdQuery = {
    project: filter.project,
    repo: filter.repository,
  };

  const response = await fetchFromTinybird<TinybirdActivityTypesResponse>(
    '/v0/pipes/activity_types.json',
    query
  );

  return response.data;
}