// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import {DateTime} from "luxon";
import {
  mockCurrentSummaryData,
  mockPreviousSummaryData,
  mockIssuesOpened,
  mockIssuesClosed,
  mockIssueResolutionVelocity
} from '../../mocks/tinybird-issues-response.mock';
import {
  type ActivityCountFilter,
  ActivityFilterCountType,
  FilterGranularity
} from "../types";
import {ActivityTypes} from "~~/types/shared/activity-types";
import type {IssuesResolution} from "~~/types/development/responses.types";

const mockFetchFromTinybird = vi.fn();

describe('Issues Resolution Data Source', () => {
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

  test('should fetch issues resolution data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchIssuesResolution} = await import("~~/server/data/tinybird/issues-resolution-data-source");
    const { mergeRanges } = await import('~~/server/data/tinybird/issues-resolution-data-source');

    mockFetchFromTinybird.mockResolvedValueOnce(mockCurrentSummaryData)
      .mockResolvedValueOnce(mockPreviousSummaryData)
      .mockResolvedValueOnce(mockIssuesOpened)
      .mockResolvedValueOnce(mockIssuesClosed)
      .mockResolvedValueOnce(mockIssueResolutionVelocity);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: ActivityCountFilter = {
      granularity: FilterGranularity.WEEKLY,
      project: 'the-linux-kernel-organization',
      countType: ActivityFilterCountType.CUMULATIVE,
      activity_type: ActivityTypes.FORKS,
      onlyContributions: false,
      startDate,
      endDate
    };

    const result = await fetchIssuesResolution(filter);

    const currentCumulativeCount = mockCurrentSummaryData.data[0]?.activityCount || 0;
    const previousCumulativeCount = mockPreviousSummaryData.data[0]?.activityCount || 0;

    const expectedResult: IssuesResolution = {
      summary: {
        current: currentCumulativeCount,
        previous: previousCumulativeCount,
        percentageChange: 100,
        changeValue: currentCumulativeCount - previousCumulativeCount,
        periodFrom: filter.startDate?.toISO() || '',
        periodTo: filter.endDate?.toISO() || '',
        avgVelocityInDays: mockIssueResolutionVelocity.data[0].averageIssueResolveVelocitySeconds,
      },
      data: mergeRanges(mockIssuesOpened.data, mockIssuesClosed.data)
    };

    expect(result).toEqual(expectedResult);
  });
});
