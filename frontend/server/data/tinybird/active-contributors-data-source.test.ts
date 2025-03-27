import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import {DateTime} from "luxon";
import {
  mockMonthlyTimeseries,
  mockCurrentMonthlySummary,
  mockPreviousMonthlySummary
} from '../../mocks/tinybird-active-contributors-response.mock';
import {FilterGranularity} from "../types";
import type {ActiveContributorsResponse} from "~~/server/data/tinybird/active-contributors-data-source";

const mockFetchFromTinybird = vi.fn();

describe('Active Contributors Data Source', () => {
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

  test('should fetch active contributors data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchActiveContributors} = await import("~~/server/data/tinybird/active-contributors-data-source");

    mockFetchFromTinybird.mockResolvedValueOnce(mockCurrentMonthlySummary)
      .mockResolvedValueOnce(mockPreviousMonthlySummary)
      .mockResolvedValueOnce(mockMonthlyTimeseries);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      granularity: FilterGranularity.WEEKLY,
      project: 'the-linux-kernel-organization',
      startDate,
      endDate
    };

    const result = await fetchActiveContributors(filter);

    const currentContributorCount = mockCurrentMonthlySummary.data[0].contributorCount;
    const previousContributorCount = mockPreviousMonthlySummary.data[0].contributorCount;
    const percentageChange = ((currentContributorCount - previousContributorCount) / previousContributorCount) * 100;
    const changeValue = currentContributorCount - previousContributorCount;

    const expectedResult: ActiveContributorsResponse = {
      summary: {
        current: currentContributorCount,
        previous: previousContributorCount,
        percentageChange,
        changeValue,
        periodFrom: startDate,
        periodTo: endDate
      },
      data: mockMonthlyTimeseries.data.map((item) => ({
        startDate: item.startDate,
        endDate: item.endDate,
        contributors: item.contributorCount
      }))
    };

    expect(result).toEqual(expectedResult);
  });

  // TODO: Add checks for invalid dates, invalid data, sql injections, and other edge cases.
});
