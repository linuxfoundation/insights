// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import {
  mockCurrentSummary,
  mockPreviousSummary,
  mockActiveDaysData,
} from '../../mocks/tinybird-active-days-response.mock';
import type { ActiveDaysFilter } from '../types';
import { Granularity } from '~~/types/shared/granularity';
import type { ActiveDays } from '~~/types/development/responses.types';

const mockFetchFromTinybird = vi.fn();

describe('Active Days Data Source', () => {
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

  test('should fetch active days data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const { fetchActiveDays } = await import('~~/server/data/tinybird/active-days-data-source');

    mockFetchFromTinybird
      .mockResolvedValueOnce(mockCurrentSummary)
      .mockResolvedValueOnce(mockPreviousSummary)
      .mockResolvedValueOnce(mockActiveDaysData);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter: ActiveDaysFilter = {
      granularity: Granularity.WEEKLY,
      project: 'the-linux-kernel-organization',
      repos: ['some-repo'],
      startDate,
      endDate,
    };

    const result = await fetchActiveDays(filter);

    const expectedCurrentSummaryQuery = {
      project: filter.project,
      repos: ['some-repo'],
      startDate: filter.startDate,
      endDate: filter.endDate,
    };
    const expectedPreviousSummaryQuery = {
      project: filter.project,
      repos: ['some-repo'],
      startDate: DateTime.utc(2023, 3, 19),
      endDate: DateTime.utc(2024, 3, 19),
    };
    const expectedActiveDaysQuery = {
      project: filter.project,
      repos: ['some-repo'],
      granularity: Granularity.WEEKLY,
      startDate: filter.startDate,
      endDate: filter.endDate,
    };

    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      1,
      '/v0/pipes/active_days.json',
      expectedCurrentSummaryQuery,
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      2,
      '/v0/pipes/active_days.json',
      expectedPreviousSummaryQuery,
    );
    expect(mockFetchFromTinybird).toHaveBeenNthCalledWith(
      3,
      '/v0/pipes/active_days.json',
      expectedActiveDaysQuery,
    );

    const currentActiveDays = mockCurrentSummary.data[0].activeDaysCount;
    const previousActiveDays = mockPreviousSummary.data[0].activeDaysCount;
    const { avgContributionsPerDay } = mockCurrentSummary.data[0];

    const expectedResult: ActiveDays = {
      summary: {
        current: currentActiveDays,
        previous: previousActiveDays,
        percentageChange: 100,
        changeValue: currentActiveDays - previousActiveDays,
        periodFrom: filter.startDate?.toString() || '',
        periodTo: filter.endDate?.toString() || '',
      },
      avgContributions: avgContributionsPerDay,
      data: mockActiveDaysData.data.map((item, index) => ({
        startDate: item.startDate,
        endDate: item.endDate,
        day: index + 1,
        contributions: item.activityCount,
      })),
    };

    expect(result).toEqual(expectedResult);
  });
});
