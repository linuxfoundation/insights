// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// https://api.us-west-2.aws.tinybird.co/v0/pipes/collection_insights_aggregate.json?collectionSlug=my-collection-slug
export const mockCollectionInsightsAggregateResponse = {
  meta: [
    {
      name: 'projectCount',
      type: 'UInt64',
    },
    {
      name: 'uniqueContributorCount',
      type: 'UInt64',
    },
    {
      name: 'avgHealthScore',
      type: 'Nullable(Float64)',
    },
  ],
  data: [
    {
      projectCount: 48,
      uniqueContributorCount: 1248,
      avgHealthScore: 78,
    },
  ],
  rows: 1,
  rows_before_limit_at_least: 1,
  statistics: {
    elapsed: 0.187345,
    rows_read: 214032,
    bytes_read: 18234112,
  },
};
