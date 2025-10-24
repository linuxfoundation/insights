// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
/*
https://api.us-west-2.aws.tinybird.co/v0/pipes/active_organizations.json?project=the-linux-kernel-organization&startDate=2024-03-20 00:00:00&endDate=2025-03-20 00:00:00&activity_type=authored-commit&granularity=monthly
 */
export const mockMonthlyTimeseries = {
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
      name: 'organizationCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      organizationCount: 154,
    },
    {
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      organizationCount: 283,
    },
    {
      startDate: '2024-05-01',
      endDate: '2024-05-31',
      organizationCount: 262,
    },
    {
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      organizationCount: 267,
    },
    {
      startDate: '2024-07-01',
      endDate: '2024-07-31',
      organizationCount: 256,
    },
    {
      startDate: '2024-08-01',
      endDate: '2024-08-31',
      organizationCount: 275,
    },
    {
      startDate: '2024-09-01',
      endDate: '2024-09-30',
      organizationCount: 241,
    },
    {
      startDate: '2024-10-01',
      endDate: '2024-10-31',
      organizationCount: 249,
    },
    {
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      organizationCount: 169,
    },
    {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      organizationCount: 110,
    },
    {
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      organizationCount: 71,
    },
    {
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      organizationCount: 41,
    },
    {
      startDate: '2025-03-01',
      endDate: '2025-03-31',
      organizationCount: 57,
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.316495588,
    rows_read: 360307,
    bytes_read: 25939537,
  },
};

// https://api.us-west-2.aws.tinybird.co/v0/pipes/active_organizations.json?project=the-linux-kernel-organization&startDate=2024-03-20%2000:00:00&endDate=2025-03-20%2000:00:00&activity_type=authored-commit
export const mockCurrentMonthlySummary = {
  meta: [
    {
      name: 'organizationCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      organizationCount: 704,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.030169245,
    rows_read: 359306,
    bytes_read: 25931536,
  },
};

// https://api.us-west-2.aws.tinybird.co/v0/pipes/active_organizations.json?project=the-linux-kernel-organization&startDate=2023-03-20%2000:00:00&endDate=2024-03-20%2000:00:00&activity_type=authored-commit
export const mockPreviousMonthlySummary = {
  meta: [
    {
      name: 'organizationCount',
      type: 'UInt64',
    },
  ],
  data: [
    {
      organizationCount: 886,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.243617526,
    rows_read: 478133,
    bytes_read: 35766781,
  },
};
