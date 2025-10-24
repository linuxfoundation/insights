// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import {
  mockCurrentSummary,
  mockPreviousSummary,
  mockWaitTimeFor1stReviewData,
} from '../../mocks/tinybird-wait-time-for-1st-review-response.mock';
import type { WaitTime1stReview } from '~~/types/development/responses.types';
import type { WaitTimeFor1stReviewFilter } from '~~/server/data/types';
import { Granularity } from '~~/types/shared/granularity';

const mockFetchFromTinybird = vi.fn();

describe('Wait Time For 1st Review Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside the data source module would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import('./tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  test('should fetch wait time for 1st review data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const { fetchWaitTimeFor1stReview } = await import(
      '~~/server/data/tinybird/wait-time-for-1st-review-data-source'
    );

    mockFetchFromTinybird
      .mockResolvedValueOnce(mockCurrentSummary)
      .mockResolvedValueOnce(mockPreviousSummary)
      .mockResolvedValueOnce(mockWaitTimeFor1stReviewData);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: WaitTimeFor1stReviewFilter = {
      granularity: Granularity.WEEKLY,
      project: 'the-linux-kernel-organization',
      startDate,
      endDate,
    };

    const result = await fetchWaitTimeFor1stReview(filter);

    const expectedTinybirdPath = '/v0/pipes/pull_requests_average_time_to_first_review.json';

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

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      1,
      expectedTinybirdPath,
      expectedCurrentSummaryQuery,
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      2,
      expectedTinybirdPath,
      expectedPreviousSummaryQuery,
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(3, expectedTinybirdPath, filter);

    const currentWaitTime = mockCurrentSummary.data[0]?.averageTimeToFirstReviewSeconds || 0;
    const previousWaitTime = mockPreviousSummary.data[0]?.averageTimeToFirstReviewSeconds || 0;

    const expectedResult: WaitTime1stReview = {
      summary: {
        current: currentWaitTime,
        previous: previousWaitTime,
        percentageChange: 100,
        changeValue: currentWaitTime - previousWaitTime,
        periodFrom: filter.startDate?.toString() || '',
        periodTo: filter.endDate?.toString() || '',
      },
      data: mockWaitTimeFor1stReviewData.data.map((item) => ({
        startDate: item.startDate,
        endDate: item.endDate,
        waitTime: item.averageTimeToFirstReviewSeconds,
      })),
    };

    expect(result).toEqual(expectedResult);
  });
});
