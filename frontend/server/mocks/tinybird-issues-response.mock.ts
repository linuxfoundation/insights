// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockCurrentSummaryData = {
  meta: [
    {
      name: 'activityCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      activityCount: 100,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.320078864,
    rows_read: 357628,
    bytes_read: 18362864,
  },
};

export const mockPreviousSummaryData = {
  meta: [
    {
      name: 'activityCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      activityCount: 50,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.279353225,
    rows_read: 474679,
    bytes_read: 24215414,
  },
};

export const mockIssuesOpened = {
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
      name: 'activityCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      startDate: '2023-03-01',
      endDate: '2023-03-31',
      activityCount: 12,
    },
    {
      startDate: '2023-04-01',
      endDate: '2023-04-30',
      activityCount: 3,
    },
    {
      startDate: '2023-05-01',
      endDate: '2023-05-31',
      activityCount: 8,
    },
    {
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      activityCount: 93,
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415,
  },
};

export const mockIssuesClosed = {
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
      name: 'activityCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      startDate: '2023-03-01',
      endDate: '2023-03-31',
      activityCount: 8,
    },
    {
      startDate: '2023-04-01',
      endDate: '2023-04-30',
      activityCount: 1,
    },
    {
      startDate: '2023-05-01',
      endDate: '2023-05-31',
      activityCount: 6,
    },
    {
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      activityCount: 6,
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415,
  },
};

export const mockIssueResolutionVelocity = {
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
      name: 'activityCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      averageIssueResolveVelocitySeconds: 7451999,
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415,
  },
};
