import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import {DateTime} from "luxon";
import {mockTimeseries} from '../../mocks/tinybird-contributors-leaderboard-response.mock';
import type {ContributorsLeaderboardResponse} from "~~/server/data/tinybird/contributors-leaderboard-data-source";

const mockFetchFromTinybird = vi.fn();

describe('Contributors Leaderboard Data Source', () => {
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

  test('should fetch contributors leaderboard data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchContributorsLeaderboard} = await import("~~/server/data/tinybird/contributors-leaderboard-data-source");

    mockFetchFromTinybird.mockResolvedValue(mockTimeseries);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      project: 'the-linux-kernel-organization',
      startDate,
      endDate
    };

    const result = await fetchContributorsLeaderboard(filter);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/contributors_leaderboard.json',
      filter
    );

    const expectedResult: ContributorsLeaderboardResponse = {
      meta: {
        offset: 0,
        limit: 10,
        total: 10
      },
      data: mockTimeseries.data.map((item) => ({
        avatar: item.avatar,
        name: item.displayName,
        contributions: item.contributionCount,
        contributionValue: 0,
        contributionPercentage: item.contributionPercentage
      }))
    };

    expect(result).toEqual(expectedResult);
  });

  // TODO: Add checks for invalid dates, invalid data, sql injections, and other edge cases.
});
