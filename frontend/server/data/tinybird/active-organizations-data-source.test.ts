// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  describe, test, expect, vi, beforeEach
} from 'vitest';
import {DateTime} from "luxon";
import {
  mockMonthlyTimeseries,
  mockCurrentMonthlySummary,
  mockPreviousMonthlySummary
} from '../../mocks/tinybird-active-organizations-response.mock';
import {Granularity} from "~~/types/shared/granularity";
import type {ActiveOrganizationsResponse} from "~~/server/data/tinybird/active-organizations-data-source";

const mockFetchFromTinybird = vi.fn();

describe('Active Organizations Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside active-organizations-data-source.ts would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import("./tinybird"), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  })

  test('should fetch active organizations data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const {fetchActiveOrganizations} = await import("~~/server/data/tinybird/active-organizations-data-source");

    mockFetchFromTinybird.mockResolvedValueOnce(mockCurrentMonthlySummary)
      .mockResolvedValueOnce(mockPreviousMonthlySummary)
      .mockResolvedValueOnce(mockMonthlyTimeseries);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      granularity: Granularity.WEEKLY,
      project: 'the-linux-kernel-organization',
      startDate,
      endDate
    };

    const result = await fetchActiveOrganizations(filter);

    const currentOrganizationCount = mockCurrentMonthlySummary.data[0].organizationCount;
    const previousOrganizationCount = mockPreviousMonthlySummary.data[0].organizationCount;
    const percentageChange = ((currentOrganizationCount - previousOrganizationCount) / previousOrganizationCount) * 100;
    const changeValue = currentOrganizationCount - previousOrganizationCount;

    const expectedResult: ActiveOrganizationsResponse = {
      summary: {
        current: currentOrganizationCount,
        previous: previousOrganizationCount,
        percentageChange,
        changeValue,
        periodFrom: startDate,
        periodTo: endDate
      },
      data: mockMonthlyTimeseries.data.map((item) => ({
        startDate: item.startDate,
        endDate: item.endDate,
        organizations: item.organizationCount
      }))
    };

    expect(result).toEqual(expectedResult);
  });

  // TODO: Add checks for invalid dates, invalid data, sql injections, and other edge cases.
});
