// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { BenchmarkKeys, type AggregateKey } from '~~/types/shared/benchmark.types';
import { WidgetArea } from '~/components/modules/widget/types/widget-area';

export interface AggregateData {
  key: AggregateKey;
  benchmarkKeys: BenchmarkKeys[];
}

export const aggregateData: AggregateData[] = [
  {
    key: WidgetArea.CONTRIBUTORS,
    benchmarkKeys: [
      BenchmarkKeys.Retention,
      BenchmarkKeys.ActiveContributors,
      BenchmarkKeys.ContributorDependency,
      BenchmarkKeys.OrganizationDependency,
    ]
  },
  {
    key: WidgetArea.POPULARITY,
    benchmarkKeys: [
      BenchmarkKeys.Stars, 
      BenchmarkKeys.Forks, 
      BenchmarkKeys.SearchQueries
    ]
  },
  {
    key: WidgetArea.DEVELOPMENT,
    benchmarkKeys: [
      BenchmarkKeys.IssuesResolution,
      BenchmarkKeys.PullRequests,
      BenchmarkKeys.ActiveDays,
      BenchmarkKeys.MergeLeadTime,
      BenchmarkKeys.ContributionsOutsideWorkHours
    ]
  },
  {
    key: WidgetArea.SECURITY,
    benchmarkKeys: []
  }
];
