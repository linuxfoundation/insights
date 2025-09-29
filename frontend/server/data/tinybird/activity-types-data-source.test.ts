// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import type {ActivityTypesFilter} from "~~/types/development/requests.types";
import type {ActivityTypesTinybirdQuery} from "~~/server/data/tinybird/requests.types";

const mockFetchFromTinybird = vi.fn();

const mockActivityTypesResponse = {
  data: {
    github: ['pull_request-opened', 'pull_request-merged', 'issue-comment'],
    gitlab: ['merge_request-opened', 'merge_request-merged'],
    jira: ['issue-created', 'issue-updated']
  }
};

describe('Activity Types Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    vi.doMock(import("./tinybird"), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  test('should fetch activity types with correct parameters', async () => {
    const {fetchActivityTypes} = await import("~~/server/data/tinybird/activity-types-data-source");

    mockFetchFromTinybird.mockResolvedValueOnce(mockActivityTypesResponse);

    const filter: ActivityTypesFilter = {
      project: 'test-project',
      repository: 'test-repo'
    };

    const result = await fetchActivityTypes(filter);

    const expectedQuery: ActivityTypesTinybirdQuery = {
      project: 'test-project',
      repo: 'test-repo'
    };

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/activity_types.json',
      expectedQuery
    );

    expect(result).toEqual(mockActivityTypesResponse.data);
  });

  test('should fetch activity types without repository parameter', async () => {
    const {fetchActivityTypes} = await import("~~/server/data/tinybird/activity-types-data-source");

    mockFetchFromTinybird.mockResolvedValueOnce(mockActivityTypesResponse);

    const filter: ActivityTypesFilter = {
      project: 'test-project'
    };

    const result = await fetchActivityTypes(filter);

    const expectedQuery: ActivityTypesTinybirdQuery = {
      project: 'test-project',
      repo: undefined
    };

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/activity_types.json',
      expectedQuery
    );

    expect(result).toEqual(mockActivityTypesResponse.data);
  });
});