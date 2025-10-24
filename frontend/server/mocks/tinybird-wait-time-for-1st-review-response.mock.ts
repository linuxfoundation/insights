// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockCurrentSummary = {
  meta: [
    {
      name: 'activityCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      averageTimeToFirstReviewSeconds: 100,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.320078864,
    rows_read: 357628,
    bytes_read: 18362864,
  },
};

export const mockPreviousSummary = {
  meta: [
    {
      name: 'activityCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      averageTimeToFirstReviewSeconds: 50,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.279353225,
    rows_read: 474679,
    bytes_read: 24215414,
  },
};

export const mockWaitTimeFor1stReviewData = {
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
      name: 'averageTimeToFirstReviewSeconds',
      type: 'UInt64',
    },
  ],
  data: [
    {
      startDate: '2023-03-01',
      endDate: '2023-03-31',
      averageTimeToFirstReviewSeconds: 12,
    },
    {
      startDate: '2023-04-01',
      endDate: '2023-04-30',
      averageTimeToFirstReviewSeconds: 3,
    },
    {
      startDate: '2023-05-01',
      endDate: '2023-05-31',
      averageTimeToFirstReviewSeconds: 8,
    },
    {
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      averageTimeToFirstReviewSeconds: 93,
    },
  ],
  rows: 5,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415,
  },
};
