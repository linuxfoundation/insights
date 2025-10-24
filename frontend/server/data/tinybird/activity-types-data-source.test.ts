// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { ActivityTypesFilter } from '~~/types/development/requests.types';
import type { ActivityTypesTinybirdQuery } from '~~/server/data/tinybird/requests.types';

const mockFetchFromTinybird = vi.fn();

const mockTinybirdResponse = {
  data: [
    { platform: 'github', activityType: 'pull_request-opened', label: 'Opened a pull request' },
    { platform: 'github', activityType: 'pull_request-merged', label: 'Merged a pull request' },
    { platform: 'github', activityType: 'issue-comment', label: 'Commented on an issue' },
    { platform: 'gitlab', activityType: 'merge_request-opened', label: 'Opened a merge request' },
    { platform: 'gitlab', activityType: 'merge_request-merged', label: 'Merged a merge request' },
    { platform: 'jira', activityType: 'issue-created', label: 'Created an issue' },
    { platform: 'jira', activityType: 'issue-updated', label: 'Updated an issue' },
  ],
};

const expectedGroupedResponse = {
  github: [
    { key: 'pull_request-opened', label: 'Opened a pull request' },
    { key: 'pull_request-merged', label: 'Merged a pull request' },
    { key: 'issue-comment', label: 'Commented on an issue' },
  ],
  gitlab: [
    { key: 'merge_request-opened', label: 'Opened a merge request' },
    { key: 'merge_request-merged', label: 'Merged a merge request' },
  ],
  jira: [
    { key: 'issue-created', label: 'Created an issue' },
    { key: 'issue-updated', label: 'Updated an issue' },
  ],
};

describe('Activity Types Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    vi.doMock(import('./tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  test('should fetch activity types with correct parameters and transform response', async () => {
    const { fetchActivityTypes } = await import(
      '~~/server/data/tinybird/activity-types-data-source'
    );

    mockFetchFromTinybird.mockResolvedValueOnce(mockTinybirdResponse);

    const filter: ActivityTypesFilter = {
      project: 'test-project',
      repos: ['test-repo'],
      includeCodeContributions: true,
      includeCollaborations: false,
      includeOtherContributions: true,
    };

    const result = await fetchActivityTypes(filter);

    const expectedQuery: ActivityTypesTinybirdQuery = {
      project: 'test-project',
      repos: ['test-repo'],
      includeCodeContributions: true,
      includeCollaborations: false,
      includeOtherContributions: true,
    };

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/activityTypes_by_project.json',
      expectedQuery,
    );

    expect(result).toEqual(expectedGroupedResponse);
  });

  test('should fetch activity types without optional parameters', async () => {
    const { fetchActivityTypes } = await import(
      '~~/server/data/tinybird/activity-types-data-source'
    );

    mockFetchFromTinybird.mockResolvedValueOnce(mockTinybirdResponse);

    const filter: ActivityTypesFilter = {
      project: 'test-project',
    };

    const result = await fetchActivityTypes(filter);

    const expectedQuery: ActivityTypesTinybirdQuery = {
      project: 'test-project',
      repos: undefined,
      includeCodeContributions: undefined,
      includeCollaborations: undefined,
      includeOtherContributions: undefined,
    };

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/activityTypes_by_project.json',
      expectedQuery,
    );

    expect(result).toEqual(expectedGroupedResponse);
  });
});
