import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import { DateTime } from "luxon";
import {
  mockCurrentSummary,
  mockPreviousSummary,
  mockAverageTimeToMerge
} from '../../mocks/tinybird-average-time-to-merge-response.mock';
import type { AverageTimeMerge } from "~~/types/development/responses.types";
import type {AverageTimeToMergeFilter} from "~~/server/data/types";
import {FilterGranularity} from "~~/server/data/types";

const mockFetchFromTinybird = vi.fn();

describe('Average Time to Merge Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside the data source module would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import("./tinybird"), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  })

  test('should fetch average time to merge data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchAverageTimeToMerge} = await import("~~/server/data/tinybird/average-time-to-merge-data-source");

    mockFetchFromTinybird.mockResolvedValueOnce(mockCurrentSummary)
      .mockResolvedValueOnce(mockPreviousSummary)
      .mockResolvedValueOnce(mockAverageTimeToMerge);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: AverageTimeToMergeFilter = {
      granularity: FilterGranularity.WEEKLY,
      project: 'the-linux-kernel-organization',
      startDate,
      endDate
    };

    const result = await fetchAverageTimeToMerge(filter);

    const expectedTinybirdPath = '/v0/pipes/pull_requests_average_time_to_merge.json';

    const expectedCurrentSummaryQuery = {
      project: filter.project,
      startDate: filter.startDate,
      endDate: filter.endDate,
    };
    const expectedPreviousSummaryQuery = {
      project: filter.project,
      startDate: DateTime.utc(2023, 3, 19),
      endDate: DateTime.utc(2024, 3, 19),
    };

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(1, expectedTinybirdPath, expectedCurrentSummaryQuery);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(2, expectedTinybirdPath, expectedPreviousSummaryQuery);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(3, expectedTinybirdPath, filter);

    const currentAverageTime = mockCurrentSummary.data[0]?.averageTimeToMergeSeconds || 0;
    const previousAverageTime = mockPreviousSummary.data[0]?.averageTimeToMergeSeconds || 0;

    const expectedResult: AverageTimeMerge = {
      summary: {
        current: currentAverageTime,
        previous: previousAverageTime,
        percentageChange: 100,
        changeValue: currentAverageTime - previousAverageTime,
        periodFrom: filter.startDate?.toISO() || '',
        periodTo: filter.endDate?.toISO() || '',
      },
      data: mockAverageTimeToMerge.data.map((item) => ({
        startDate: item.startDate,
        endDate: item.endDate,
        averageTime: item.averageTimeToMergeSeconds,
      }))
    };

    expect(result).toEqual(expectedResult);
  });
});
