// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export const mockCollectionDevelopmentAggregate = {
  meta: [
    { name: 'activeContributorsLast365Days', type: 'UInt64' },
    { name: 'activeOrganizationsLast365Days', type: 'UInt64' },
  ],
  data: [
    {
      activeContributorsLast365Days: 1284,
      activeOrganizationsLast365Days: 156,
    },
  ],
  rows: 1,
  statistics: {
    elapsed: 0.10671584,
    rows_read: 12297,
    bytes_read: 1180641,
  },
};
