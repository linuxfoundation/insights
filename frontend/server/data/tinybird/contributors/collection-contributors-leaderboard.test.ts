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
import type { CollectionContributorsLeaderboardFilter } from '~~/server/data/types';
import type { CollectionContributorsLeaderboardTinybirdQuery } from '~~/server/data/tinybird/requests.types';

describe('Collection Contributors Leaderboard Data Source', () => {
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

  test('should fetch collection-scoped contributors leaderboard data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const { fetchCollectionContributorsLeaderboard } =
      await import('~~/server/data/tinybird/contributors/collection-contributors-leaderboard');

    mockFetchFromTinybird
      .mockResolvedValueOnce(mockTimeseries)
      .mockResolvedValueOnce(mockContributorsLeaderboardCount);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: CollectionContributorsLeaderboardFilter = {
      collectionSlug: 'cncf',
      repos: ['linux'],
      platform: ActivityPlatforms.GITHUB,
      activity_type: ActivityTypes.AUTHORED_COMMIT,
      activity_types: [ActivityTypes.AUTHORED_COMMIT, ActivityTypes.CO_AUTHORED_COMMIT],
      includeCollaborations: false,
      startDate,
      endDate,
    };

    const expectedDataQuery: CollectionContributorsLeaderboardTinybirdQuery = {
      collectionSlug: filter.collectionSlug,
      platform: filter.platform,
      activity_type: filter.activity_type,
      activity_types: filter.activity_types,
      includeCollaborations: filter.includeCollaborations,
      repos: filter.repos,
      limit: filter.limit,
      offset: filter.offset,
      startDate: filter.startDate,
      endDate: filter.endDate,
    };

    const result = await fetchCollectionContributorsLeaderboard(filter);

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      1,
      '/v0/pipes/collection_contributors_leaderboard.json',
      expectedDataQuery,
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      2,
      '/v0/pipes/collection_contributors_leaderboard.json',
      {
        collectionSlug: filter.collectionSlug,
        platform: filter.platform,
        activity_type: filter.activity_type,
        activity_types: filter.activity_types,
        includeCollaborations: filter.includeCollaborations,
        repos: filter.repos,
        startDate: filter.startDate,
        endDate: filter.endDate,
        count: true,
      },
    );

    const expectedResult: ContributorLeaderboard = {
      meta: {
        offset: filter.offset || 0,
        limit: filter.limit || 10,
        total: mockContributorsLeaderboardCount.data[0].count,
      },
      data: mockTimeseries.data.map((item) => ({
        avatar: item.avatar,
        name: item.displayName,
        contributions: item.contributionCount,
        percentage: item.contributionPercentage,
        roles: item.roles || [],
        githubHandleArray: item.githubHandleArray,
      })),
    };

    expect(result).toEqual(expectedResult);
  });
});
