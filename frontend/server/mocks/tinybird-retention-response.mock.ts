// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// https://api.us-west-2.aws.tinybird.co/v0/pipes/contributor_retention.json?startDate=2024-03-20 00:00:00&endDate=2025-03-20 00:00:00&project=the-linux-kernel-organization&granularity=monthly
export const mockContributorRetentionData = {
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
      name: 'retentionRate',
      type: 'Float64',
    },
  ],
  data: [
    {
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      retentionRate: 68.94,
    },
    {
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      retentionRate: 64.67,
    },
    {
      startDate: '2024-05-01',
      endDate: '2024-05-31',
      retentionRate: 57.39,
    },
    {
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      retentionRate: 60.57,
    },
    {
      startDate: '2024-07-01',
      endDate: '2024-07-31',
      retentionRate: 58.64,
    },
    {
      startDate: '2024-08-01',
      endDate: '2024-08-31',
      retentionRate: 59.72,
    },
    {
      startDate: '2024-09-01',
      endDate: '2024-09-30',
      retentionRate: 56.22,
    },
    {
      startDate: '2024-10-01',
      endDate: '2024-10-31',
      retentionRate: 58.57,
    },
    {
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      retentionRate: 53.05,
    },
    {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      retentionRate: 58.64,
    },
    {
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      retentionRate: 57.77,
    },
    {
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      retentionRate: 27.87,
    },
    {
      startDate: '2025-03-01',
      endDate: '2025-03-31',
      retentionRate: 38.83,
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.412489953,
    rows_read: 795243,
    bytes_read: 75444485,
  },
};

// https://api.us-west-2.aws.tinybird.co/v0/pipes/organization_retention.json?startDate=2024-03-20 00:00:00&endDate=2025-03-20 00:00:00&project=the-linux-kernel-organization&granularity=monthly
export const mockOrganizationRetentionData = {
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
      name: 'retentionRate',
      type: 'Float64',
    },
  ],
  data: [
    {
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      retentionRate: 77.74,
    },
    {
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      retentionRate: 72.45,
    },
    {
      startDate: '2024-05-01',
      endDate: '2024-05-31',
      retentionRate: 67.73,
    },
    {
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      retentionRate: 69.36,
    },
    {
      startDate: '2024-07-01',
      endDate: '2024-07-31',
      retentionRate: 68.42,
    },
    {
      startDate: '2024-08-01',
      endDate: '2024-08-31',
      retentionRate: 72,
    },
    {
      startDate: '2024-09-01',
      endDate: '2024-09-30',
      retentionRate: 66.43,
    },
    {
      startDate: '2024-10-01',
      endDate: '2024-10-31',
      retentionRate: 72.3,
    },
    {
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      retentionRate: 59.8,
    },
    {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      retentionRate: 43.25,
    },
    {
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      retentionRate: 52.55,
    },
    {
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      retentionRate: 47.59,
    },
    {
      startDate: '2025-03-01',
      endDate: '2025-03-31',
      retentionRate: 63.79,
    },
  ],
  rows: 13,
  statistics: {
    elapsed: 0.068190336,
    rows_read: 795243,
    bytes_read: 66313517,
  },
};
