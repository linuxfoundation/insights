import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import {DateTime} from "luxon";
import {
  mockContributorRetentionData,
  mockOrganizationRetentionData
} from '../../mocks/tinybird-retention-response.mock';
import {DemographicType, FilterGranularity} from "~~/server/data/types";
import type {RetentionDataPoint, RetentionResponse} from "~~/server/data/tinybird/retention-data-source";

const mockFetchFromTinybird = vi.fn();

describe('Retention Data Source', () => {
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

  test('should fetch contributors retention data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchRetention} = await import("~~/server/data/tinybird/retention-data-source");

    mockFetchFromTinybird.mockResolvedValue(mockContributorRetentionData);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      project: 'the-linux-kernel-organization',
      granularity: FilterGranularity.MONTHLY,
      onlyContributions: false,
      demographicType: DemographicType.CONTRIBUTORS,
      startDate,
      endDate
    };

    const result = await fetchRetention(filter);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/contributor_retention.json',
      filter
    );

    const expectedResult: RetentionResponse = mockContributorRetentionData.data.map(
      (item): RetentionDataPoint => ({
        startDate: item.startDate,
        endDate: item.endDate,
        percentage: item.retentionRate,
      })
    );

    expect(result).toEqual(expectedResult);
  });

  // Ideally, this second scenario should be done with a test matrix, so we don't have to repeat so much code.
  // After a bried search, I couldn't find documentation on how to do this with Vitest, so I'm opting for leaving it
  // like this for now.
  test('should fetch organization retention data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchRetention} = await import("~~/server/data/tinybird/retention-data-source");

    mockFetchFromTinybird.mockResolvedValue(mockOrganizationRetentionData);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      project: 'the-linux-kernel-organization',
      granularity: FilterGranularity.MONTHLY,
      onlyContributions: false,
      demographicType: DemographicType.ORGANIZATIONS,
      startDate,
      endDate
    };

    const result = await fetchRetention(filter);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/organization_retention.json',
      filter
    );

    const expectedResult: RetentionResponse = mockOrganizationRetentionData.data.map(
      (item): RetentionDataPoint => ({
        startDate: item.startDate,
        endDate: item.endDate,
        percentage: item.retentionRate,
      })
    );

    expect(result).toEqual(expectedResult);
  });

  // TODO: Add checks for invalid dates, invalid data, sql injections, and other edge cases.
});
