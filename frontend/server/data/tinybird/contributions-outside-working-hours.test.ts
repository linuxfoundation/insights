// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import {
  mockCurrentData,
  mockPreviousData,
} from '../../mocks/tinybird-activities-heatmap-by-weekday-and-2hours-blocks-response.mock';
import type { ContributionOutsideHours } from '~~/types/development/responses.types';
import type { ContributionsOutsideWorkHoursFilter } from '~~/types/development/requests.types';
import type { ActivityHeatmapByWeekdayTBQuery } from '~~/server/data/tinybird/requests.types';

const mockFetchFromTinybird = vi.fn();

describe('Code Review Engagement Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside active-contributors-data-source.ts would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import('./tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  test('should fetch contributions outside working hours data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const { fetchContributionsOutsideWorkHours } = await import(
      '~~/server/data/tinybird/contributions-outside-work-hours-data-source'
    );

    mockFetchFromTinybird
      .mockResolvedValueOnce(mockCurrentData)
      .mockResolvedValueOnce(mockPreviousData);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: ContributionsOutsideWorkHoursFilter = {
      project: 'the-linux-kernel-organization',
      repos: ['some-repo'],
      startDate,
      endDate,
    };

    const result = await fetchContributionsOutsideWorkHours(filter);

    const expectedCurrentDataQuery: ActivityHeatmapByWeekdayTBQuery = {
      project: filter.project,
      repos: filter.repos,
      includeCodeContributions: filter.includeCodeContributions,
      includeCollaborations: filter.includeCollaborations,
      startDate: filter.startDate,
      endDate: filter.endDate,
    };

    const expectedPreviousDataQuery: ActivityHeatmapByWeekdayTBQuery = {
      project: filter.project,
      repos: filter.repos,
      startDate: DateTime.utc(2023, 3, 19),
      endDate: DateTime.utc(2024, 3, 19),
    };

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      1,
      '/v0/pipes/activity_heatmap_by_weekday_and_2hours_blocks.json',
      expectedCurrentDataQuery,
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      2,
      '/v0/pipes/activity_heatmap_by_weekday_and_2hours_blocks.json',
      expectedPreviousDataQuery,
    );

    const expectedResult: ContributionOutsideHours = {
      summary: {
        current: 44.63414634146341,
        previous: 43.48547717842324,
        percentageChange: 2.6415006516477306,
        changeValue: 1.148669163040175,
        periodFrom: filter.startDate?.toISO() || '',
        periodTo: filter.endDate?.toISO() || '',
      },
      weekdayOutsideHoursPercentage: 40.16260162601626,
      weekendOutsideHoursPercentage: 4.471544715447155,
      data: mockCurrentData.data.map((item) => ({
        day: item.weekday - 1, // We have to subtract 1 because the frontend uses a 0-indexed approach.
        hour: item.twoHoursBlock,
        contributions: item.activityCount,
      })),
    };

    expect(result).toEqual(expectedResult);
  });

  // TODO: Add checks for invalid dates, invalid data, sql injections, and other edge cases.
});
