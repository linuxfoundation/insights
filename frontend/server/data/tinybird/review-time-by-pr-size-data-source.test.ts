// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import { mockReviewTimeByPRSizeData } from '../../mocks/tinybird-review-time-by-pr-size-response.mock';
import type { ReviewTimeByPrItem } from '~~/types/development/responses.types';
import type { ReviewTimeByPRSizeFilter } from '~~/server/data/types';

const mockFetchFromTinybird = vi.fn();

describe('Review Time By PR Size Data Source', () => {
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

  test('should fetch review time by PR size data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const { fetchReviewTimeByPRSize } = await import(
      '~~/server/data/tinybird/review-time-by-pr-size-data-source'
    );

    mockFetchFromTinybird.mockResolvedValueOnce(mockReviewTimeByPRSizeData);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: ReviewTimeByPRSizeFilter = {
      project: 'the-linux-kernel-organization',
      repos: ['some-random-repo'],
      startDate,
      endDate,
    };

    const result = await fetchReviewTimeByPRSize(filter);

    const expectedTinybirdPath = '/v0/pipes/pull_requests_review_time_by_size.json';

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(expectedTinybirdPath, filter);

    const expectedResult: ReviewTimeByPrItem[] = mockReviewTimeByPRSizeData.data.map(
      (item, index) => ({
        sortId: index,
        lines: item.gitChangedLinesBucket,
        prCount: item.pullRequestCount,
        averageReviewTime: item.reviewedInSecondsAvg,
        averageReviewTimeUnit: 'seconds',
      }),
    );

    expect(result).toEqual(expectedResult);
  });
});
