// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockCurrentSummary = {
  meta: [
    {
      name: "activeDaysCount",
      type: "UInt64"
    },
    {
      name: "avgContributionsPerDay",
      type: "Nullable(Float64)"
    }
  ],
  data: [
    {
      activeDaysCount: 100,
      avgContributionsPerDay: 19
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.006776631,
    rows_read: 2797,
    bytes_read: 265756
  }
};

export const mockPreviousSummary = {
  meta: [
    {
      name: "activeDaysCount",
      type: "UInt64"
    },
    {
      name: "avgContributionsPerDay",
      type: "Nullable(Float64)"
    }
  ],
  data: [
    {
      activeDaysCount: 50,
      avgContributionsPerDay: 22
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.008489256,
    rows_read: 11661,
    bytes_read: 1107836
  }
};

export const mockActiveDaysData = {
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
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      activityCount: 698
    },
    {
      startDate: "2025-02-01",
      endDate: "2025-02-28",
      activityCount: 579
    },
    {
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      activityCount: 472
    },
    {
      startDate: "2025-04-01",
      endDate: "2025-04-30",
      activityCount: 1
    }
  ],
  rows: 4,
  statistics: {
    elapsed: 0.013195823,
    rows_read: 3797,
    bytes_read: 276546
  }
};
