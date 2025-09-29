// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import {DateTime} from "luxon";
import {
  mockCurrentSummaryData,
  mockPreviousSummaryData,
  mockCurrentCumulativeTimeseries,
  mockCurrentNewTimeseries,
} from '../../mocks/tinybird-stars-response.mock';
import {ActivityFilterCountType} from "../types";
import {ActivityTypes} from "~~/types/shared/activity-types";
import {Granularity} from "~~/types/shared/granularity";
import type {StarsData} from "~~/types/popularity/responses.types";

const mockFetchFromTinybird = vi.fn();

describe('Stars Data Source', () => {
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

  test('should fetch cumulative stars data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchStarsActivities} = await import("~~/server/data/tinybird/stars-data-source");

    mockFetchFromTinybird.mockResolvedValueOnce(mockCurrentSummaryData)
      .mockResolvedValueOnce(mockPreviousSummaryData)
      .mockResolvedValueOnce(mockCurrentCumulativeTimeseries);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      granularity: Granularity.WEEKLY,
      project: 'the-linux-kernel-organization',
      countType: ActivityFilterCountType.CUMULATIVE,
      activity_type: ActivityTypes.FORKS,
      onlyContributions: false,
      includeCodeContributions: true,
      includeCollaborations: true,
      startDate,
      endDate
    };

    const result = await fetchStarsActivities(filter);

    const currentCumulativeCount = mockCurrentSummaryData.data[0]?.activityCount || 0;
    const previousCumulativeCount = mockPreviousSummaryData.data[0]?.activityCount || 0;

    const expectedResult: StarsData = {
      summary: {
        current: currentCumulativeCount,
        previous: previousCumulativeCount,
        percentageChange: 100,
        changeValue: currentCumulativeCount - previousCumulativeCount,
        periodFrom: filter.startDate?.toString(),
        periodTo: filter.endDate?.toString(),
      },
      data: mockCurrentCumulativeTimeseries.data.map((item) => ({
        startDate: item.startDate,
        endDate: item.endDate,
        stars: item.cumulativeActivityCount,
      }))
    };

    expect(result).toEqual(expectedResult);
  });

  test('should fetch new stars data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchStarsActivities} = await import("~~/server/data/tinybird/stars-data-source");

    mockFetchFromTinybird.mockResolvedValueOnce(mockCurrentSummaryData)
      .mockResolvedValueOnce(mockPreviousSummaryData)
      .mockResolvedValueOnce(mockCurrentNewTimeseries);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      granularity: Granularity.WEEKLY,
      project: 'the-linux-kernel-organization',
      countType: ActivityFilterCountType.NEW,
      activity_type: ActivityTypes.FORKS,
      onlyContributions: false,
      includeCodeContributions: true,
      includeCollaborations: true,
      startDate,
      endDate
    };

    const result = await fetchStarsActivities(filter);

    const currentCumulativeCount = mockCurrentSummaryData.data[0]?.activityCount || 0;
    const previousCumulativeCount = mockPreviousSummaryData.data[0]?.activityCount || 0;

    const expectedResult: StarsData = {
      summary: {
        current: currentCumulativeCount,
        previous: previousCumulativeCount,
        percentageChange: 100,
        changeValue: currentCumulativeCount - previousCumulativeCount,
        periodFrom: filter.startDate?.toString(),
        periodTo: filter.endDate?.toString(),
      },
      data: mockCurrentNewTimeseries.data.map((item) => ({
        startDate: item.startDate,
        endDate: item.endDate,
        stars: item.activityCount,
      }))
    };

    expect(result).toEqual(expectedResult);
  });

  // TODO: Add checks for invalid dates, invalid data, sql injections, and other edge cases.
});
