// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import {
  mockTimeseries,
  mockOrganizationsLeaderboardCount,
} from '../../../mocks/tinybird-organizations-leaderboard-response.mock';
import type { OrganizationLeaderboard } from '~~/types/contributors/responses.types';
import { ActivityTypes } from '~~/types/shared/activity-types';
import { ActivityPlatforms } from '~~/types/shared/activity-platforms';
import type { OrganizationsLeaderboardFilter } from '~~/server/data/types';
import type { OrganizationsLeaderboardTinybirdQuery } from '~~/server/data/tinybird/requests.types';

const mockFetchFromTinybird = vi.fn();

describe('Organizations Leaderboard Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside active-organizations.ts would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import('../tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  test('should fetch organizations leaderboard data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const { fetchOrganizationsLeaderboard } =
      await import('~~/server/data/tinybird/contributors/organizations-leaderboard');

    mockFetchFromTinybird
      .mockResolvedValueOnce(mockTimeseries)
      .mockResolvedValueOnce(mockOrganizationsLeaderboardCount);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: OrganizationsLeaderboardFilter = {
      project: 'the-linux-kernel-organization',
      platform: ActivityPlatforms.GITHUB,
      activity_type: ActivityTypes.AUTHORED_COMMIT,
      includeCodeContributions: true,
      includeCollaborations: false,
      offset: 2,
      limit: 7,
      startDate,
      endDate,
    };

    const expectedDataQuery: OrganizationsLeaderboardTinybirdQuery = filter;

    const expectedCountQuery = {
      ...expectedDataQuery,
      count: true,
    };

    const result = await fetchOrganizationsLeaderboard(filter);

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      1,
      '/v0/pipes/organizations_leaderboard.json',
      expectedDataQuery,
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      2,
      '/v0/pipes/organizations_leaderboard.json',
      expectedCountQuery,
    );

    const expectedResult: OrganizationLeaderboard = {
      meta: {
        offset: filter.offset || 0,
        limit: filter.limit || 10,
        total: mockOrganizationsLeaderboardCount.data[0].count,
      },
      data: mockTimeseries.data.map((item) => ({
        logo: item.logo,
        name: item.displayName,
        contributions: item.contributionCount,
        percentage: item.contributionPercentage,
        website: '',
      })),
    };

    expect(result).toEqual(expectedResult);
  });
});
