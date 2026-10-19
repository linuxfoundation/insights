// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockCurrentOpenedPRsSummary = {
  meta: [
    {
      name: 'pullRequestCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      pullRequestCount: 100,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.320078864,
    rows_read: 357628,
    bytes_read: 18362864,
  },
};

export const mockPreviousOpenedPRsSummary = {
  meta: [
    {
      name: 'pullRequestCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      pullRequestCount: 50,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.279353225,
    rows_read: 474679,
    bytes_read: 24215414,
  },
};

export const mockCurrentMergedPRsSummary = {
  meta: [
    {
      name: 'pullRequestCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      pullRequestCount: 25,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.320078864,
    rows_read: 357628,
    bytes_read: 18362864,
  },
};

export const mockPreviousMergedPRsSummary = {
  meta: [
    {
      name: 'pullRequestCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      pullRequestCount: 50,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.279353225,
    rows_read: 474679,
    bytes_read: 24215414,
  },
};

export const mockCurrentClosedPRsSummary = {
  meta: [
    {
      name: 'pullRequestCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      pullRequestCount: 10,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.320078864,
    rows_read: 357628,
    bytes_read: 18362864,
  },
};

export const mockPreviousClosedPRsSummary = {
  meta: [
    {
      name: 'pullRequestCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      pullRequestCount: 5,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.279353225,
    rows_read: 474679,
    bytes_read: 24215414,
  },
};

export const mockOpenedPullRequests = {
  meta: [
    {
      name: 'startDate',
      type: 'Nullable(Date)',
    },
    {
      name: 'endDate',
      type: 'Nullable(Date)',
    },
    {
      name: 'pullRequestCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      startDate: '2023-03-01',
      endDate: '2023-03-31',
      pullRequestCount: 11,
    },
    {
      startDate: '2023-04-01',
      endDate: '2023-04-30',
      pullRequestCount: 4,
    },
    {
      startDate: '2023-05-01',
      endDate: '2023-05-31',
      pullRequestCount: 7,
    },
    {
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      pullRequestCount: 21,
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415,
  },
};

export const mockMergedPullRequests = {
  meta: [
    {
      name: 'startDate',
      type: 'Nullable(Date)',
    },
    {
      name: 'endDate',
      type: 'Nullable(Date)',
    },
    {
      name: 'pullRequestCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      startDate: '2023-03-01',
      endDate: '2023-03-31',
      pullRequestCount: 8,
    },
    {
      startDate: '2023-04-01',
      endDate: '2023-04-30',
      pullRequestCount: 1,
    },
    {
      startDate: '2023-05-01',
      endDate: '2023-05-31',
      pullRequestCount: 6,
    },
    {
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      pullRequestCount: 6,
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415,
  },
};

export const mockClosedPullRequests = {
  meta: [
    {
      name: 'startDate',
      type: 'Nullable(Date)',
    },
    {
      name: 'endDate',
      type: 'Nullable(Date)',
    },
    {
      name: 'pullRequestCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      startDate: '2023-03-01',
      endDate: '2023-03-31',
      pullRequestCount: 2,
    },
    {
      startDate: '2023-04-01',
      endDate: '2023-04-30',
      pullRequestCount: 1,
    },
    {
      startDate: '2023-05-01',
      endDate: '2023-05-31',
      pullRequestCount: 3,
    },
    {
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      pullRequestCount: 2,
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415,
  },
};

export const mockPullRequestsVelocity = {
  meta: [
    {
      name: 'startDate',
      type: 'Nullable(Date)',
    },
    {
      name: 'endDate',
      type: 'Nullable(Date)',
    },
    {
      name: 'pullRequestCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      averagePullRequestResolveVelocitySeconds: 7451999,
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415,
  },
};
