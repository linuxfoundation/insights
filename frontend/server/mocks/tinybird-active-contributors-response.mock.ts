/*
https://api.us-west-2.aws.tinybird.co/v0/pipes/active_contributors.json?project=the-linux-kernel-organization&startDate=2024-03-20 00:00:00&endDate=2025-03-20 00:00:00&activity_type=authored-commit&granularity=monthly
 */
export const mockMonthlyTimeseries = {
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
      name: "contributorCount",
      type: "UInt64"
    }
  ],
  data: [
    {
      startDate: "2024-03-01",
      endDate: "2024-03-31",
      contributorCount: 623
    },
    {
      startDate: "2024-04-01",
      endDate: "2024-04-30",
      contributorCount: 1327
    },
    {
      startDate: "2024-05-01",
      endDate: "2024-05-31",
      contributorCount: 1148
    },
    {
      startDate: "2024-06-01",
      endDate: "2024-06-30",
      contributorCount: 1241
    },
    {
      startDate: "2024-07-01",
      endDate: "2024-07-31",
      contributorCount: 1215
    },
    {
      startDate: "2024-08-01",
      endDate: "2024-08-31",
      contributorCount: 1299
    },
    {
      startDate: "2024-09-01",
      endDate: "2024-09-30",
      contributorCount: 1082
    },
    {
      startDate: "2024-10-01",
      endDate: "2024-10-31",
      contributorCount: 1197
    },
    {
      startDate: "2024-11-01",
      endDate: "2024-11-30",
      contributorCount: 1065
    },
    {
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      contributorCount: 1137
    },
    {
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      contributorCount: 819
    },
    {
      startDate: "2025-02-01",
      endDate: "2025-02-28",
      contributorCount: 233
    },
    {
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      contributorCount: 164
    }
  ],
  rows: 13,
  statistics: {
    elapsed: 0.303075811,
    rows_read: 349219,
    bytes_read: 27822157
  }
};

// https://api.us-west-2.aws.tinybird.co/v0/pipes/active_contributors.json?project=the-linux-kernel-organization&startDate=2024-03-20%2000:00:00&endDate=2025-03-20%2000:00:00&activity_type=authored-commit
export const mockCurrentMonthlySummary = {
  meta:
    [
      {
        name: "contributorCount",
        type: "UInt64"
      }
    ],

  data:
    [
      {
        contributorCount: 4584
      }
    ],

  rows: 1,

  statistics:
    {
      elapsed: 0.244195565,
      rows_read: 349407,
      bytes_read: 28243435
    }
};

// https://api.us-west-2.aws.tinybird.co/v0/pipes/active_contributors.json?project=the-linux-kernel-organization&startDate=2023-03-20%2000:00:00&endDate=2024-03-20%2000:00:00&activity_type=authored-commit
export const mockPreviousMonthlySummary = {
  meta:
    [
      {
        name: "contributorCount",
        type: "UInt64"
      }
    ],

  data:
    [
      {
        contributorCount: 4802
      }
    ],

  rows: 1,

  statistics:
    {
      elapsed: 0.035380394,
      rows_read: 476333,
      bytes_read: 38034421
    }
};
