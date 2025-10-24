// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockReviewTimeByPRSizeData = {
  meta: [
    {
      name: 'gitChangedLinesBucket',
      type: 'String',
    },
    {
      name: 'reviewedInSecondsAvg',
      type: 'Nullable(Float64)',
    },
    {
      name: 'pullRequestCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      gitChangedLinesBucket: '1-9',
      reviewedInSecondsAvg: 34017,
      pullRequestCount: 5,
    },
    {
      gitChangedLinesBucket: '10-59',
      reviewedInSecondsAvg: 30572,
      pullRequestCount: 20,
    },
    {
      gitChangedLinesBucket: '60-99',
      reviewedInSecondsAvg: 1581,
      pullRequestCount: 5,
    },
    {
      gitChangedLinesBucket: '100-499',
      reviewedInSecondsAvg: 122352,
      pullRequestCount: 14,
    },
    {
      gitChangedLinesBucket: '500+',
      reviewedInSecondsAvg: 288799,
      pullRequestCount: 28,
    },
  ],
  rows: 5,
  statistics: {
    elapsed: 0.010491204,
    rows_read: 2430,
    bytes_read: 160485,
  },
};
