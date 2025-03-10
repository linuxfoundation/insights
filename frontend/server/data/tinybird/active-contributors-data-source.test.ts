import {
  describe, test, expect, vi
} from 'vitest';
import type { $Fetch } from 'nitropack';
import {DateTime} from "luxon";
import {
  mockWeeklyTimeseries,
  mockWeeklyCurrentSummary,
  mockWeeklyPreviousSummary
} from '../../mocks/tinybird-active-contributors-response.mock';
import {createActiveContributorsDataSource} from '../active-contributors-data-source';
import type {ActiveContributorsResponse} from "../types";
import { ContributorsFilterGranularity} from "../types";

describe('ContributorsDataSource', () => {
  test('should fetch contributors data with correct parameters', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(mockWeeklyCurrentSummary)
      .mockResolvedValueOnce(mockWeeklyPreviousSummary)
      // The double type assertion is necessary because the mockFetch function needs to satisfy the type
      // signature of the $Fetch type that createContributorsDataSource expects, even though they're structurally
      // different types.
      // Since we can't cast the mock function directly to $Fetch, we first cast it to unknown (which can be
      // cast to anything) and then cast it to $Fetch.
      .mockResolvedValueOnce(mockWeeklyTimeseries) as unknown as $Fetch;

    const dataSource = createActiveContributorsDataSource(mockFetch);

    const currentStartDate = DateTime.utc(2022, 0, 1);
    const currentEndDate = DateTime.utc(2023, 0, 1);

    const filter = {
      granularity: ContributorsFilterGranularity.WEEKLY,
      project: 'gerrit',
      repo: 'https://gerrit.automotivelinux.org/gerrit/q/project:apps/homescreen',
      startDate: currentStartDate,
      endDate: currentEndDate
    };

    const fakeDate = DateTime.utc(2022, 11, 11)
    vi.useFakeTimers();
    vi.setSystemTime(fakeDate.toJSDate());

    const result = await dataSource.fetchActiveContributors(filter);

    vi.useRealTimers();

    const currentContributorCount = mockWeeklyCurrentSummary.data[0].contributorCount;
    const previousContributorCount = mockWeeklyPreviousSummary.data[0].contributorCount;
    const percentageChange = ((currentContributorCount - previousContributorCount) / previousContributorCount) * 100;
    const changeValue = currentContributorCount - previousContributorCount;

    const expectedResult: ActiveContributorsResponse = {
      summary: {
        current: currentContributorCount,
        previous: previousContributorCount,
        percentageChange,
        changeValue,
        periodFrom: currentStartDate,
        periodTo: currentEndDate
      },
      data: mockWeeklyTimeseries.data.map((item) => ({
        startDate: item.startDate,
        endDate: item.endDate,
        contributors: item.contributorCount
      }))
    };

    expect(result).toEqual(expectedResult);
  });
});
