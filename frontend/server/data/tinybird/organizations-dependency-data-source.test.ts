import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import {DateTime} from "luxon";
import {mockTimeseries} from '../../mocks/tinybird-organizations-dependency-response.mock';
import {
  mockTimeseries as mockLeaderboardTimeseries
} from '../../mocks/tinybird-organizations-leaderboard-response.mock';
import type {OrganizationDependencyResponse} from "~~/server/data/tinybird/organizations-dependency-data-source";

const mockFetchFromTinybird = vi.fn();

describe('Organizations Dependency Data Source', () => {
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

  test('should fetch organizations dependency data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchOrganizationDependency} = await import("~~/server/data/tinybird/organizations-dependency-data-source");

    mockFetchFromTinybird.mockResolvedValueOnce(mockTimeseries).mockResolvedValueOnce(mockLeaderboardTimeseries);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      project: 'the-linux-kernel-organization',
      startDate,
      endDate
    };

    const result = await fetchOrganizationDependency(filter);

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      1,
      '/v0/pipes/organization_dependency.json',
      filter
    )
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      2,
      '/v0/pipes/organizations_leaderboard.json',
      {
        ...filter,
        limit: 5
      }
    );

    const topOrganizationsCount = mockTimeseries.data.length;
    const lastOrganization = mockTimeseries.data.at(-1);
    const topOrganizationsPercentage = lastOrganization?.contributionPercentageRunningTotal || 0;
    const totalOrganizationCount = mockTimeseries.data[0]?.totalOrganizationCount || 0;

    const expectedResult: OrganizationDependencyResponse = {
      topOrganizations: {
        count: topOrganizationsCount,
        percentage: topOrganizationsPercentage
      },
      otherOrganizations: {
        count: Math.max(0, (totalOrganizationCount || 0) - topOrganizationsCount),
        percentage: 100 - topOrganizationsPercentage
      },
      list: mockLeaderboardTimeseries.data.map((item) => ({
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
