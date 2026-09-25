// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import { fetchActivityCounts } from '../src/lib/activity-count.js';
import {
  bucketsPath,
  calledUrls,
  mockFetch,
  pipeCalls,
  tinybirdStub,
  useApp,
} from './helpers/tinybird.js';

const activitiesCount = '/v0/pipes/activities_count.json';
const cumulativeCount = '/v0/pipes/activities_cumulative_count.json';
const repo = 'https://github.com/kubernetes/kubernetes';

const seriesRows = [
  { startDate: '2025-01-01', endDate: '2025-01-31', activityCount: 4, cumulativeActivityCount: 10 },
  { startDate: '2025-02-01', endDate: '2025-02-28', cumulativeActivityCount: 12 },
];

const request = { log: { warn: () => {}, error: () => {}, info: () => {} } } as never;
const query = {
  repos: [repo, ''],
  startDate: '2025-01-01',
  endDate: '2025-03-01',
  granularity: 'monthly' as const,
};
const starParams = {
  activity_type: 'star',
  onlyContributions: false,
  includeCodeContributions: true,
  includeCollaborations: true,
  includeOtherContributions: true,
};

function stub(bucket?: unknown[]) {
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.searchParams.has('granularity')) {
        return seriesRows;
      }
      return [{ activityCount: url.searchParams.get('startDate')?.startsWith('2025') ? 6 : 3 }];
    }, bucket),
  );
}

useApp();

beforeEach(() => {
  stub();
});

describe('fetchActivityCounts', () => {
  it('sends the caller pipe params with project, bucketId and repos on all three calls', async () => {
    await fetchActivityCounts(request, 'kubernetes', query, starParams);

    const calls = pipeCalls();
    expect(calls).toHaveLength(3);
    for (const url of calls) {
      expect(Object.fromEntries(url.searchParams)).toMatchObject({
        project: 'kubernetes',
        bucketId: '7',
        activity_type: 'star',
        onlyContributions: 'false',
        includeCodeContributions: 'true',
        includeCollaborations: 'true',
        includeOtherContributions: 'true',
      });
      expect(url.searchParams.getAll('repos')).toEqual([repo]);
    }
    expect(calls.filter((url) => url.searchParams.get('granularity') === 'monthly')).toHaveLength(
      1,
    );
  });

  it('keeps project, bucketId and repos when the caller params name them too', async () => {
    await fetchActivityCounts(request, 'kubernetes', query, {
      ...starParams,
      project: 'other',
      bucketId: 99,
      repos: ['https://github.com/other/other'],
    });

    expect(pipeCalls()).toHaveLength(3);
    for (const url of pipeCalls()) {
      expect(url.searchParams.get('project')).toBe('kubernetes');
      expect(url.searchParams.get('bucketId')).toBe('7');
      expect(url.searchParams.getAll('repos')).toEqual([repo]);
    }
  });

  it('returns the period summary and new counts per bucket, reading a missing count as 0', async () => {
    const result = await fetchActivityCounts(request, 'kubernetes', query, starParams);

    expect(result.summary).toMatchObject({ current: 6, previous: 3, changeValue: 3 });
    expect(result.data).toEqual([
      { startDate: '2025-01-01T00:00:00Z', endDate: '2025-01-31T00:00:00Z', count: 4 },
      { startDate: '2025-02-01T00:00:00Z', endDate: '2025-02-28T00:00:00Z', count: 0 },
    ]);
  });

  it('reads the running total from activities_cumulative_count when countType=cumulative', async () => {
    const result = await fetchActivityCounts(
      request,
      'kubernetes',
      { ...query, countType: 'cumulative' },
      starParams,
    );

    const series = pipeCalls().filter((url) => url.searchParams.has('granularity'));
    expect(series.map((url) => url.pathname)).toEqual([cumulativeCount]);
    expect(
      pipeCalls()
        .filter((url) => !url.searchParams.has('granularity'))
        .map((url) => url.pathname),
    ).toEqual([activitiesCount, activitiesCount]);
    expect(result.data.map((row) => row.count)).toEqual([10, 12]);
  });

  it('answers a zero summary and no buckets for an unknown slug after the bucket lookup alone', async () => {
    stub([]);

    const result = await fetchActivityCounts(request, 'unknown', query, starParams);

    expect(calledUrls().map((url) => url.pathname)).toEqual([bucketsPath]);
    expect(result.summary).toMatchObject({ current: 0, previous: 0, changeValue: 0 });
    expect(result.data).toEqual([]);
  });
});
