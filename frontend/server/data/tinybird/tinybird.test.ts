import {
 describe, test, expect, vi
} from 'vitest';
import type {$Fetch} from "nitropack";
import type {ActiveContributorsFilter} from "../types";
import { ContributorsFilterGranularity} from "../types";
import {formatDateForTinyBird, fetchFromTinybird} from './tinybird';
import {useRuntimeConfig} from "#imports";
import {DateTime} from "luxon";

describe('fetchFromTinybird', () => {
  const config = useRuntimeConfig();
  const {tinybirdToken} = config;
  const mockFetch = vi.fn().mockImplementation(() => Promise.resolve({})) as unknown as $Fetch;

  test('should send a request to Tinybird with the desired parameters', async () => {
    const endpoint = '/v0/pipes/active_contributors.json';

    const query: ActiveContributorsFilter = {
      project: 'test-project',
      repo: 'test-repo',
      granularity: ContributorsFilterGranularity.MONTHLY,
      fromDate: DateTime.utc(2023, 0, 1),
      toDate: DateTime.utc(2023, 11, 31),
    }
    await fetchFromTinybird(endpoint, query, mockFetch);

    // Check that the request was made with the right parameters, including the Tinybird token,
    // which should have been added to the query
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(endpoint),
      {
        query: {
          ...query,
          fromDate: formatDateForTinyBird(<DateTime>query.fromDate),
          toDate: formatDateForTinyBird(<DateTime>query.toDate),
        },
        headers: {
          Authorization: `Bearer ${tinybirdToken}`,
        }
      }
    );
  });

  test('active contributors request should not include parameters that are not provided', async () => {
    const endpoint = '/v0/pipes/active_contributors.json';

    const query: ActiveContributorsFilter = {
      project: 'test-project',
      granularity: ContributorsFilterGranularity.MONTHLY,
    }
    await fetchFromTinybird(endpoint, query, mockFetch);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(endpoint),
      {
        query: {
          ...query,
        },
        headers: {
          Authorization: `Bearer ${tinybirdToken}`,
        }
      }
    );
  });

  test('should handle API errors gracefully', async () => {
    const mockFetch = vi.fn().mockImplementation(() => Promise.reject(new Error('API Error'))) as unknown as $Fetch;
    const endpoint = '/v0/pipes/active_contributors.json';
      const query: ActiveContributorsFilter = {
        project: 'test-project',
        granularity: ContributorsFilterGranularity.MONTHLY,
      }
      await expect(fetchFromTinybird(endpoint, query, mockFetch)).rejects.toThrow('API Error');
    });
});
