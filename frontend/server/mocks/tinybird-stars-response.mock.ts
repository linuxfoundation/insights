// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockCurrentSummaryData = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      activityCount: 100
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.320078864,
    rows_read: 357628,
    bytes_read: 18362864
  }
};

export const mockPreviousSummaryData = {
  meta: [
    {
      name: "activityCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      activityCount: 50
    }
  ],
  rows: 1,
  statistics: {
    elapsed: 0.279353225,
    rows_read: 474679,
    bytes_read: 24215414
  }
};

export const mockCurrentCumulativeTimeseries = {
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
      name: "cumulativeActivityCount",
      type: "Nullable(UInt64)"
    }
  ],
  data: [
    {
      startDate: "2024-03-01",
      endDate: "2024-03-31",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2024-04-01",
      endDate: "2024-04-30",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2024-05-01",
      endDate: "2024-05-31",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2024-06-01",
      endDate: "2024-06-30",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2024-07-01",
      endDate: "2024-07-31",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2024-08-01",
      endDate: "2024-08-31",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2024-09-01",
      endDate: "2024-09-30",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2024-10-01",
      endDate: "2024-10-31",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2024-11-01",
      endDate: "2024-11-30",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2025-02-01",
      endDate: "2025-02-28",
      cumulativeActivityCount: 0
    },
    {
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      cumulativeActivityCount: 0
    }
  ],
  rows: 13,
  statistics: {
    elapsed: 0.680491604,
    rows_read: 5847561,
    bytes_read: 292784030
  }
};

export const mockCurrentNewTimeseries = {
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
      startDate: "2023-03-01",
      endDate: "2023-03-31",
      activityCount: 0
    },
    {
      startDate: "2023-04-01",
      endDate: "2023-04-30",
      activityCount: 0
    },
    {
      startDate: "2023-05-01",
      endDate: "2023-05-31",
      activityCount: 0
    },
    {
      startDate: "2023-06-01",
      endDate: "2023-06-30",
      activityCount: 0
    },
    {
      startDate: "2023-07-01",
      endDate: "2023-07-31",
      activityCount: 0
    },
    {
      startDate: "2023-08-01",
      endDate: "2023-08-31",
      activityCount: 0
    },
    {
      startDate: "2023-09-01",
      endDate: "2023-09-30",
      activityCount: 0
    },
    {
      startDate: "2023-10-01",
      endDate: "2023-10-31",
      activityCount: 0
    },
    {
      startDate: "2023-11-01",
      endDate: "2023-11-30",
      activityCount: 0
    },
    {
      startDate: "2023-12-01",
      endDate: "2023-12-31",
      activityCount: 0
    },
    {
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      activityCount: 0
    },
    {
      startDate: "2024-02-01",
      endDate: "2024-02-29",
      activityCount: 0
    },
    {
      startDate: "2024-03-01",
      endDate: "2024-03-31",
      activityCount: 0
    }
  ],
  rows: 13,
  statistics: {
    elapsed: 0.031928949,
    rows_read: 475680,
    bytes_read: 24223415
  }
};
