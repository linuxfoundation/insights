// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BenchmarkKeys, type AggregateKey } from '~~/types/shared/benchmark.types';

export interface AggregateData {
  key: AggregateKey;
  benchmarkKeys: BenchmarkKeys[];
}

export const aggregateData: AggregateData[] = [
  {
    key: 'contributors',
    benchmarkKeys: [
      BenchmarkKeys.Retention,
      BenchmarkKeys.ActiveContributors,
      BenchmarkKeys.ContributorDependency,
      BenchmarkKeys.OrganizationDependency,
      BenchmarkKeys.GeographicalDistribution
    ]
  },
  {
    key: 'popularity',
    benchmarkKeys: [BenchmarkKeys.Stars, BenchmarkKeys.Forks]
  },
  {
    key: 'development',
    benchmarkKeys: [
      BenchmarkKeys.IssuesResolution,
      BenchmarkKeys.PullRequests,
      BenchmarkKeys.ActiveDays,
      BenchmarkKeys.MergeLeadTime,
      BenchmarkKeys.ContributionsOutsideWorkHours
    ]
  },
  {
    key: 'security',
    benchmarkKeys: []
  }
];
