// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockQuarterlyActivitiesCountData = {
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
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      startDate: "2024-01-01",
      endDate: "2024-03-31",
      activityCount: 16268
    },
    {
      startDate: "2024-04-01",
      endDate: "2024-06-30",
      activityCount: 165669
    },
    {
      startDate: "2024-07-01",
      endDate: "2024-09-30",
      activityCount: 166763
    },
    {
      startDate: "2024-10-01",
      endDate: "2024-12-31",
      activityCount: 167523
    },
    {
      startDate: "2025-01-01",
      endDate: "2025-03-31",
      activityCount: 143598
    }
  ],
  rows: 5,
  statistics: {
    elapsed: 0.078178269,
    rows_read: 823179,
    bytes_read: 78082047
  }
}

export const mockActivitiesCountCurrentSummary = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      activityCount: 1000
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.350372935,
    rows_read: 913112,
    bytes_read: 86727248
  }
}

export const mockActivitiesCountPreviousSummary = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      activityCount: 500
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.350372935,
    rows_read: 913112,
    bytes_read: 86727248
  }
}