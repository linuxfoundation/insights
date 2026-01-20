// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import {
  mockContributorsGeoDistTimeseries,
  mockOrganizationsGeoDistTimeseries,
} from '../../../mocks/tinybird-geo-distribution-response.mock';
import { DemographicType } from '~~/server/data/types';
import type { GeographicDistributionResponse } from '~~/server/data/tinybird/contributors/geographic-distribution';

const mockFetchFromTinybird = vi.fn();

describe('Geographic Distribution Data Source', () => {
  beforeEach(() => {
    mockFetchFromTinybird.mockClear();

    // Here be dragons! vi.doMock is not hoisted, and thus it is executed after the original import statement.
    // This means that the import for tinybird.ts inside active-organizations.ts would still be used,
    // and thus not mocked. This means we need to import the module again after the mock is set, whenever we want to
    // use it.
    vi.doMock(import('../tinybird'), () => ({
      fetchFromTinybird: mockFetchFromTinybird,
    }));
  });

  test('should fetch contributors geographic distribution data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const { fetchGeographicDistribution } =
      await import('~~/server/data/tinybird/contributors/geographic-distribution');

    mockFetchFromTinybird.mockResolvedValue(mockContributorsGeoDistTimeseries);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      project: 'the-linux-kernel-organization',
      type: DemographicType.CONTRIBUTORS,
      includeCodeContributions: true,
      includeCollaborations: false,
      startDate,
      endDate,
    };

    const result = await fetchGeographicDistribution(filter);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/contributors_geo_distribution.json',
      filter,
    );

    const processedData = mockContributorsGeoDistTimeseries.data.map((item) => ({
      name: item.country,
      code: item.country_code,
      flag: item.flag,
      count: item.contributorCount,
      percentage: item.contributorPercentage,
    }));

    const expectedResult: GeographicDistributionResponse = {
      summary: {
        totalContributions: 0,
      },
      data: processedData,
    };

    expect(result).toEqual(expectedResult);
  });

  // Ideally, this second scenario should be done with a test matrix, so we don't have to repeat so much code.
  // After a bried search, I couldn't find documentation on how to do this with Vitest, so I'm opting for leaving it
  // like this for now.
  test('should fetch organizations geographic distribution data with correct parameters', async () => {
    // We have to import this here again because vi.doMock is not hoisted. See the explanation in beforeEach().
    const { fetchGeographicDistribution } =
      await import('~~/server/data/tinybird/contributors/geographic-distribution');

    mockFetchFromTinybird.mockResolvedValue(mockOrganizationsGeoDistTimeseries);

    const startDate = DateTime.utc(2024, 3, 20);
    const endDate = DateTime.utc(2025, 3, 20);

    const filter = {
      project: 'the-linux-kernel-organization',
      type: DemographicType.ORGANIZATIONS,
      startDate,
      endDate,
    };

    const result = await fetchGeographicDistribution(filter);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/organizations_geo_distribution.json',
      filter,
    );

    const expectedResult: GeographicDistributionResponse = {
      summary: {
        totalContributions: 0,
      },
      data: mockOrganizationsGeoDistTimeseries.data.map((item) => ({
        name: item.country,
        code: item.country_code,
        flag: item.flag,
        count: item.organizationCount,
        percentage: item.organizationPercentage,
      })),
    };

    expect(result).toEqual(expectedResult);
  });
});
