// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockCollectionPopularityAggregate = {
  meta: [
    { name: 'totalStars', type: 'UInt64' },
    { name: 'totalForks', type: 'UInt64' },
    { name: 'starsPrevious365Days', type: 'UInt64' },
    { name: 'forksPrevious365Days', type: 'UInt64' },
  ],
  data: [
    {
      totalStars: 48213,
      totalForks: 9120,
      starsPrevious365Days: 41032,
      forksPrevious365Days: 8340,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.279353225,
    rows_read: 474679,
    bytes_read: 24215414,
  },
};
