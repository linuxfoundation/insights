// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import {
  mockTimeseries,
  mockContributorsLeaderboardCount,
} from '../../../mocks/tinybird-contributors-leaderboard-response.mock';
import type { ContributorLeaderboard } from '~~/types/contributors/responses.types';
import { ActivityTypes } from '~~/types/shared/activity-types';
import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import type { ContributorsLeaderboardFilter } from '~~/server/data/types';
import type { ContributorsLeaderboardTinybirdQuery } from '~~/server/data/tinybird/requests.types';

describe('Contributors Leaderboard Data Source', () => {
  const mockFetchFromTinybird = vi.fn();

  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside the data source would still be used, and thus not mocked.
    // In turn, this means that we need to import the module again after the mock is set, whenever we want to use it.
    vi.doMock(import('../tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  test('should fetch contributors leaderboard data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const { fetchContributorsLeaderboard } = await import(
      '~~/server/data/tinybird/contributors/contributors-leaderboard'
    );

    mockFetchFromTinybird
      .mockResolvedValueOnce(mockTimeseries)
      .mockResolvedValueOnce(mockContributorsLeaderboardCount);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: ContributorsLeaderboardFilter = {
      project: 'the-linux-kernel-organization',
      repos: ['linux'],
      platform: ActivityPlatforms.GITHUB,
      activity_type: ActivityTypes.AUTHORED_COMMIT,
      includeCodeContributions: true,
      includeCollaborations: false,
      startDate,
      endDate,
    };

    const expectedDataQuery: ContributorsLeaderboardTinybirdQuery = filter;

    const expectedCountQuery = {
      ...expectedDataQuery,
      count: true,
    };

    const result = await fetchContributorsLeaderboard(filter);

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      1,
      '/v0/pipes/contributors_leaderboard.json',
      expectedDataQuery,
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      2,
      '/v0/pipes/contributors_leaderboard.json',
      expectedCountQuery,
    );

    const expectedResult: ContributorLeaderboard = {
      meta: {
        offset: filter.offset || 0,
        limit: filter.limit || 10,
        total: mockContributorsLeaderboardCount.data[0].count,
      },
      data: mockTimeseries.data.map((item) => ({
        id: item.id,
        avatar: item.avatar,
        name: item.displayName,
        contributions: item.contributionCount,
        percentage: item.contributionPercentage,
        roles: item.roles || [],
        githubHandle: item.githubHandle,
      })),
    };

    expect(result).toEqual(expectedResult);
  });

  test('should not aggregate contributors with different IDs', async () => {
    // We have to import this here again because vi.doMock is not hoisted.
    const { fetchContributorsLeaderboard } = await import(
      '~~/server/data/tinybird/contributors/contributors-leaderboard'
    );

    const duplicateData = {
      ...mockTimeseries,
      data: [
        {
          id: 'user-1',
          avatar: 'avatar-1',
          displayName: 'Duplicate User',
          contributionCount: 100,
          contributionPercentage: 1,
          roles: ['role1'],
          githubHandle: 'gh1',
        },
        {
          id: 'user-2',
          avatar: 'avatar-2',
          displayName: 'Duplicate User', // Same name
          contributionCount: 50,
          contributionPercentage: 0.5,
          roles: ['role2'],
          githubHandle: 'gh2',
        },
        {
          id: 'user-3',
          avatar: 'avatar-3',
          displayName: 'Unique User',
          contributionCount: 200,
          contributionPercentage: 2,
          roles: [],
          githubHandle: 'gh3',
        },
      ],
    };

    mockFetchFromTinybird.mockResolvedValueOnce(duplicateData).mockResolvedValueOnce(mockContributorsLeaderboardCount);

    const filter: ContributorsLeaderboardFilter = {
      project: 'test-project',
      startDate: DateTime.utc(2024, 1, 1),
      endDate: DateTime.utc(2025, 1, 1),
    };

    const result = await fetchContributorsLeaderboard(filter);

    // Expect 'Duplicate User' NOT to be aggregated, but appear twice
    const user1 = result.data.find((c) => c.githubHandle === 'gh1');
    expect(user1).toBeDefined();
    expect(user1?.name).toBe('Duplicate User');
    expect(user1?.contributions).toBe(100);
    expect(user1?.roles).toEqual(['role1']);

    const user2 = result.data.find((c) => c.githubHandle === 'gh2');
    expect(user2).toBeDefined();
    expect(user2?.name).toBe('Duplicate User');
    expect(user2?.contributions).toBe(50);
    expect(user2?.roles).toEqual(['role2']);

    // Expect unique user to remain
    const uniqueUser = result.data.find((c) => c.name === 'Unique User');
    expect(uniqueUser).toBeDefined();
    expect(uniqueUser?.contributions).toBe(200);

    // Total should be 3
    expect(result.data.length).toBe(3);
  });
});
