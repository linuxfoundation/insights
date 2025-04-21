import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import {DateTime} from "luxon";
import {mockTimeseries} from '../../mocks/tinybird-organizations-leaderboard-response.mock';
import type {OrganizationLeaderboard} from "~~/types/contributors/responses.types";

const mockFetchFromTinybird = vi.fn();

describe('Organizations Leaderboard Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside active-organizations-data-source.ts would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import("./tinybird"), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  })

  test('should fetch organizations leaderboard data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {
      fetchOrganizationsLeaderboard
    } = await import("~~/server/data/tinybird/organizations-leaderboard-data-source");

    mockFetchFromTinybird.mockResolvedValue(mockTimeseries);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      project: 'the-linux-kernel-organization',
      startDate,
      endDate
    };

    const result = await fetchOrganizationsLeaderboard(filter);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/organizations_leaderboard.json',
      filter
    );

    const expectedResult: OrganizationLeaderboard = {
      meta: {
        offset: 0,
        limit: 10,
        total: 10
      },
      data: mockTimeseries.data.map((item) => ({
        logo: item.logo,
        name: item.displayName,
        contributions: item.contributionCount,
        percentage: item.contributionPercentage,
        website: ''
      }))
    };

    expect(result).toEqual(expectedResult);
  });

  // TODO: Add checks for invalid dates, invalid data, sql injections, and other edge cases.
});
