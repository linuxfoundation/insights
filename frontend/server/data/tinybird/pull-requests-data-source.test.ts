// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import {DateTime} from "luxon";
import {
  mockCurrentOpenedPRsSummary,
  mockPreviousOpenedPRsSummary,
  mockCurrentMergedPRsSummary,
  mockPreviousMergedPRsSummary,
  mockCurrentClosedPRsSummary,
  mockPreviousClosedPRsSummary,
  mockOpenedPullRequests,
  mockMergedPullRequests,
  mockClosedPullRequests,
  mockPullRequestsVelocity
} from '../../mocks/tinybird-pull-requests-response.mock';
import type {ActivityCountFilter} from "../types";
import {ActivityTypes} from "~~/types/shared/activity-types";
import {Granularity} from "~~/types/shared/granularity";
import type {PullRequests} from "~~/types/development/responses.types";
import type {DateRange} from "~~/server/data/util";
import {calculatePercentageChange, getPreviousDates} from "~~/server/data/util";

const mockFetchFromTinybird = vi.fn();

describe('Pull Requests Data Source', () => {
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

  /*
   * This is a long test because this data source has to send a lot of queries to Tinybird.
   */
  test('should fetch pull requests data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchPullRequests} = await import("~~/server/data/tinybird/pull-requests-data-source");

    mockFetchFromTinybird
      .mockResolvedValueOnce(mockCurrentOpenedPRsSummary)
      .mockResolvedValueOnce(mockPreviousOpenedPRsSummary)
      .mockResolvedValueOnce(mockCurrentMergedPRsSummary)
      .mockResolvedValueOnce(mockPreviousMergedPRsSummary)
      .mockResolvedValueOnce(mockCurrentClosedPRsSummary)
      .mockResolvedValueOnce(mockPreviousClosedPRsSummary)
      .mockResolvedValueOnce(mockOpenedPullRequests)
      .mockResolvedValueOnce(mockMergedPullRequests)
      .mockResolvedValueOnce(mockClosedPullRequests)
      .mockResolvedValueOnce(mockPullRequestsVelocity);

    const startDate = DateTime.utc(2025, 1, 1);
    const endDate = DateTime.utc(2025, 3, 31);

    const dates = getPreviousDates(startDate, endDate);

    const filter: ActivityCountFilter = {
      project: 'the-linux-kernel-organization',
      granularity: Granularity.WEEKLY,
      activity_type: ActivityTypes.PULL_REQUEST_OPENED,
      onlyContributions: false,
      startDate,
      endDate
    };

    const result = await fetchPullRequests(filter);

    // The granularity should not be sent in the summary queries, so we remove it here and add it when necessary in
    // the generateQuery function.
    delete filter.granularity;
    const generateQuery = (activityType: ActivityTypes, isSummary: boolean, dates: DateRange) => ({
      ...filter,
      activity_type: activityType,
      startDate: dates.from,
      endDate: dates.to,
      ...(!isSummary && {granularity: Granularity.WEEKLY})
    });

    // These are the queries the data source should send to Tinybird, in this order.
    const expectedQueries = [
      // Summaries
      generateQuery(ActivityTypes.PULL_REQUEST_OPENED, true, dates.current),
      generateQuery(ActivityTypes.PULL_REQUEST_OPENED, true, dates.previous),
      generateQuery(ActivityTypes.PULL_REQUEST_MERGED, true, dates.current),
      generateQuery(ActivityTypes.PULL_REQUEST_MERGED, true, dates.previous),
      generateQuery(ActivityTypes.PULL_REQUEST_CLOSED, true, dates.current),
      generateQuery(ActivityTypes.PULL_REQUEST_CLOSED, true, dates.previous),

      // Time series data
      generateQuery(ActivityTypes.PULL_REQUEST_OPENED, false, dates.current),
      generateQuery(ActivityTypes.PULL_REQUEST_MERGED, false, dates.current),
      generateQuery(ActivityTypes.PULL_REQUEST_CLOSED, false, dates.current),

      // Pull request resolution velocity
      {
        project: 'the-linux-kernel-organization',
        onlyContributions: false,
        startDate,
        endDate
      },
    ];

    expect(mockFetchFromTinybird).toHaveBeenCalledTimes(expectedQueries.length);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(1, '/v0/pipes/activities_count.json', expectedQueries[0]);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(2, '/v0/pipes/activities_count.json', expectedQueries[1]);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(3, '/v0/pipes/activities_count.json', expectedQueries[2]);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(4, '/v0/pipes/activities_count.json', expectedQueries[3]);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(5, '/v0/pipes/activities_count.json', expectedQueries[4]);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(6, '/v0/pipes/activities_count.json', expectedQueries[5]);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(7, '/v0/pipes/activities_count.json', expectedQueries[6]);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(8, '/v0/pipes/activities_count.json', expectedQueries[7]);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(9, '/v0/pipes/activities_count.json', expectedQueries[8]);
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      10,
      '/v0/pipes/pull_requests_average_resolve_velocity.json',
      expectedQueries[9]
    );

    const currentOpenedCount = mockCurrentOpenedPRsSummary.data[0]?.activityCount || 0;
    const previousOpenedCount = mockPreviousOpenedPRsSummary.data[0]?.activityCount || 0;
    const currentMergedCount = mockCurrentMergedPRsSummary.data[0]?.activityCount || 0;
    const previousMergedCount = mockPreviousMergedPRsSummary.data[0]?.activityCount || 0;
    const currentClosedCount = mockCurrentClosedPRsSummary.data[0]?.activityCount || 0;
    const previousClosedCount = mockPreviousClosedPRsSummary.data[0]?.activityCount || 0;
    const currentTotalCount = currentOpenedCount + currentMergedCount + currentClosedCount;
    const previousTotalCount = previousOpenedCount + previousMergedCount + previousClosedCount;
    const totalPercentageChange = calculatePercentageChange(currentTotalCount, previousTotalCount);
    const openedPercentageChange = calculatePercentageChange(currentOpenedCount, previousOpenedCount);
    const mergedPercentageChange = calculatePercentageChange(currentMergedCount, previousMergedCount);
    const closedPercentageChange = calculatePercentageChange(currentClosedCount, previousClosedCount);

    const expectedResult: PullRequests = {
      // TODO: If this is still here, don't approve the PR because I forgot to confirm what should be counted here.
      summary: {
        current: currentTotalCount,
        previous: previousTotalCount,
        percentageChange: totalPercentageChange,
        changeValue: currentTotalCount - previousTotalCount,
        periodFrom: filter.startDate?.toString() || '',
        periodTo: filter.endDate?.toString() || '',
      },
      openedSummary: {
        current: currentOpenedCount,
        previous: previousOpenedCount,
        percentageChange: openedPercentageChange,
        changeValue: currentOpenedCount - previousOpenedCount,
        periodFrom: filter.startDate?.toString() || '',
        periodTo: filter.endDate?.toString() || '',
      },
      mergedSummary: {
        current: currentMergedCount,
        previous: previousMergedCount,
        percentageChange: mergedPercentageChange,
        changeValue: currentMergedCount - previousMergedCount,
        periodFrom: filter.startDate?.toString() || '',
        periodTo: filter.endDate?.toString() || '',
      },
      closedSummary: {
        current: currentClosedCount,
        previous: previousClosedCount,
        percentageChange: closedPercentageChange,
        changeValue: currentClosedCount - previousClosedCount,
        periodFrom: filter.startDate?.toString() || '',
        periodTo: filter.endDate?.toString() || '',
      },
      avgVelocityInDays: mockPullRequestsVelocity.data[0].averagePullRequestResolveVelocitySeconds,
      data: mockOpenedPullRequests.data.map((item, index) => ({
        startDate: item.startDate,
        endDate: item.endDate,
        open: item.activityCount,
        merged: mockMergedPullRequests.data[index].activityCount,
        closed: mockClosedPullRequests.data[index].activityCount,
      }))
    };

    expect(result).toEqual(expectedResult);
  });
});
