import type { Summary } from '~/components/shared/types/summary.types';
import type { DateRange} from '~~/server/utils/date.service';
import { addTimeToDate } from '~~/server/utils/date.service';

export interface ActiveContributorsResponse {
  dateFrom?: string;
  dateTo?: string;
  contributorCount: number;
}

/**
 * Frontend expects the data to be in the following format:
 * {
 *   summary: {
 *     current: number; // current value
 *     previous: number; // previous value
 *     percentageChange: number; // percentage change (return as actual percentage ex: 2.3 percent)
 *     changeValue: number; // change value
 *     periodFrom: string; // period from
 *     periodTo: string; // period to
 *   },
 *   data: {
 *     dateFrom: string; // ISO 8601 date string - start of the bucket. Based on the interval
 *     dateTo: string; // ISO 8601 date string - end of the bucket. Based on the interval
 *     contributors: number; // count of active contributors
 *   }[];
 * }
 */
/**
 * Query params:
 * - granularity: 'weekly' | 'monthly'
 * - project: string
 * - repository: string
 * - startDate: string
 * - endDate: string
 */
export default defineEventHandler(async (event) => {
  const query: Record<string, string | number> = getQuery(event);
  const params: Record<string, string | number> = {
    project: query.project
  };
  let previousRange: DateRange | undefined;
  let summaryPreviousRes: TinybirdResponse<ActiveContributorsResponse[]> | undefined;
  const summaryData: Summary = {
    current: 0,
    previous: 0,
    percentageChange: 0,
    changeValue: 0,
    periodFrom: '',
    periodTo: ''
  };

  if (query.repository && (query.repository as string).length > 0) {
    params.repo = query.repository;
  }

  if (query.startDate && query.endDate) {
    params.fromDate = addTimeToDate(query.startDate as string);
    params.toDate = addTimeToDate(query.endDate as string);

    previousRange = getPreviousDateRange(
      query.startDate as string,
      query.endDate as string
    );

    summaryData.periodFrom = previousRange.fromDate;
    summaryData.periodTo = previousRange.toDate;
  }

  try {
    // fetch the current data (totals)
    const summaryCurrentRes = await fetchTinybird<ActiveContributorsResponse[]>(
      '/v0/pipes/active_contributors.json',
      params
    );

    if (summaryCurrentRes.data.length > 0) {
      summaryData.current = summaryCurrentRes.data[0].contributorCount;
    }

    // fetch the previous data (totals)
    if (previousRange) {
      summaryPreviousRes = await fetchTinybird<ActiveContributorsResponse[]>(
        '/v0/pipes/active_contributors.json',
        {
          ...params,
          fromDate: addTimeToDate(previousRange.fromDate),
          toDate: addTimeToDate(previousRange.toDate)
        }
      );

      if (summaryPreviousRes.data.length > 0) {
        summaryData.previous = summaryPreviousRes.data[0].contributorCount;
      }
    }

    // fetch the actual chart data
    const res = await fetchTinybird<ActiveContributorsResponse[]>(
      '/v0/pipes/active_contributors.json',
      { ...params, granularity: query.granularity }
    );

    summaryData.changeValue = summaryData.current - summaryData.previous;
    summaryData.percentageChange = (summaryData.changeValue / summaryData.previous) * 100;

    console.log('!!!!RES!!!!', params);
    return { summary: summaryData, data: res.data };
  } catch (error) {
    console.error('Error fetching active contributors:', error);
    return {
      summary: {
        current: 0,
        previous: 0,
        percentageChange: 0,
        changeValue: 0,
        periodFrom: '',
        periodTo: ''
      },
      data: []
    };
  }
});
