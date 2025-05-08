// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import { DateTime } from 'luxon';
import {
  mockCurrentData,
  mockPreviousData,
} from '../../mocks/tinybird-merge-lead-time-response.mock';
import type { MergeLeadTime } from '~~/types/development/responses.types';
import type { MergeLeadTimeFilter } from '~~/server/data/types';

const mockFetchFromTinybird = vi.fn();

describe('Merge Lead Time Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside the data source module would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import('./tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  })

  test('should fetch merge lead time data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchMergeLeadTime} = await import('~~/server/data/tinybird/merge-lead-time-data-source');

    mockFetchFromTinybird
      .mockResolvedValueOnce(mockCurrentData)
      .mockResolvedValueOnce(mockPreviousData);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: MergeLeadTimeFilter = {
      project: 'the-linux-kernel-organization',
      repo: 'some-repo',
      startDate,
      endDate
    };

    const result = await fetchMergeLeadTime(filter);

    const expectedTinybirdPath = '/v0/pipes/pull_requests_merge_lead_time.json';

    const expectedPreviousQuery = {
      ...filter,
      startDate: DateTime.utc(2023, 3, 19),
      endDate: DateTime.utc(2024, 3, 19),
    };

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(1, expectedTinybirdPath, filter);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(2, expectedTinybirdPath, expectedPreviousQuery);

    const currentValue = mockCurrentData.data[0].openedToMergedSeconds;
    const previousValue = mockPreviousData.data[0].openedToMergedSeconds;
    const currentToReviewAssigned = mockCurrentData.data[0].openedToReviewAssignedSeconds;
    const previousToReviewAssigned = mockPreviousData.data[0].openedToReviewAssignedSeconds;
    const currentToFirstReview = mockCurrentData.data[0].reviewAssignedToFirstReviewSeconds;
    const previousToFirstReview = mockPreviousData.data[0].reviewAssignedToFirstReviewSeconds;
    const currentToApproved = mockCurrentData.data[0].firstReviewToApprovedSeconds;
    const previousToApproved = mockPreviousData.data[0].firstReviewToApprovedSeconds;
    const currentToMerged = mockCurrentData.data[0].approvedToMergedSeconds;
    const previousToMerged = mockPreviousData.data[0].approvedToMergedSeconds;

    const expectedResult: MergeLeadTime = {
      summary: {
        current: currentValue,
        previous: previousValue,
        percentageChange: 100,
        changeValue: currentValue - previousValue,
        periodFrom: filter.startDate?.toISO() || '',
        periodTo: filter.endDate?.toISO() || '',
      },
      data: {
        pickup: {
          value: currentToReviewAssigned,
          unit: 'seconds',
          changeType: currentToReviewAssigned > previousToReviewAssigned ? 'positive' : 'negative'
        },
        review: {
          value: currentToFirstReview,
          unit: 'seconds',
          changeType: currentToFirstReview > previousToFirstReview ? 'positive' : 'negative'
        },
        accepted: {
          value: mockCurrentData.data[0].firstReviewToApprovedSeconds,
          unit: 'seconds',
          changeType: currentToApproved > previousToApproved ? 'positive' : 'negative'
        },
        prMerged: {
          value: mockCurrentData.data[0].approvedToMergedSeconds,
          unit: 'seconds',
          changeType: currentToMerged > previousToMerged ? 'positive' : 'negative'
        }
      }
    };

    expect(result).toEqual(expectedResult);
  });
});
