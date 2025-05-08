// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockCurrentSummary = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      averageTimeToMergeSeconds: 100
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.320078864,
    rows_read: 357628,
    bytes_read: 18362864
  }
};

export const mockPreviousSummary = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      averageTimeToMergeSeconds: 50
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.279353225,
    rows_read: 474679,
    bytes_read: 24215414
  }
};

export const mockAverageTimeToMerge = {
  meta: [
    {
      name: "startDate",
      type: "Nullable(Date)"
    },
    {
      name: "endDate",
      type: "Nullable(Date)"
    },
    {
      name: "averageTimeToMergeSeconds",
      type: "Nullable(Float64)"
    }
  ],
  data: [
    {
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      averageTimeToMergeSeconds: 674461
    },
    {
      startDate: "2025-02-01",
      endDate: "2025-02-28",
      averageTimeToMergeSeconds: 1236134
    },
    {
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      averageTimeToMergeSeconds: 531463
    }
  ],
  rows: 3,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415
  }
};
