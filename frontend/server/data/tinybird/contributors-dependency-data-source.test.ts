// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import {DateTime} from "luxon";
import {mockTimeseries} from '../../mocks/tinybird-contributors-dependency-response.mock';
import {mockTimeseries as mockLeaderboardTimeseries} from '../../mocks/tinybird-contributors-leaderboard-response.mock';
import type {ContributorDependency} from "~~/types/contributors/responses.types";

const mockFetchFromTinybird = vi.fn();

describe('Contributors Dependency Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside active-contributors-data-source.ts would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import("./tinybird"), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  })

  test('should fetch contributors dependency data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchContributorDependency} = await import("~~/server/data/tinybird/contributors-dependency-data-source");

    mockFetchFromTinybird.mockResolvedValueOnce(mockTimeseries).mockResolvedValueOnce(mockLeaderboardTimeseries);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      project: 'the-linux-kernel-organization',
      limit: 100,
      includeCodeContributions: true,
      includeCollaborations: false,
      startDate,
      endDate
    };

    const result = await fetchContributorDependency(filter);

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      1,
      '/v0/pipes/contributor_dependency.json',
      filter
    )
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      2,
      '/v0/pipes/contributors_leaderboard.json',
      {
        ...filter,
        limit: 5
      }
    );

    const topContributorsCount = mockTimeseries.data.length;
    const lastContributor = mockTimeseries.data.at(-1);
    const topContributorsPercentage = lastContributor?.contributionPercentageRunningTotal || 0;
    const totalContributorCount = mockTimeseries.data[0]?.totalContributorCount || 0;

    const expectedResult: ContributorDependency = {
      topContributors: {
        count: topContributorsCount,
        percentage: topContributorsPercentage
      },
      otherContributors: {
        count: Math.max(0, (totalContributorCount || 0) - topContributorsCount),
        percentage: 100 - topContributorsPercentage
      },
      list: mockLeaderboardTimeseries.data.map((item) => ({
        avatar: item.avatar,
        name: item.displayName,
        contributions: item.contributionCount,
        percentage: item.contributionPercentage,
        roles: item.roles || [],
      }))
    };

    expect(result).toEqual(expectedResult);
  });

  // TODO: Add checks for invalid dates, invalid data, sql injections, and other edge cases.
});
