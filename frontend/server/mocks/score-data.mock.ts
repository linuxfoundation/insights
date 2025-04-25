import type {
  ScoreAggregate,
  ScoreData
} from '~~/types/shared/benchmark.types';
import {
  BenchmarkKeys
} from '~~/types/shared/benchmark.types';

export const scoreAggregates: ScoreAggregate[] = [
  {
    aggregateKey: 'contributors',
    value: 100
  },
  {
    aggregateKey: 'popularity',
    value: 50
  },
  {
    aggregateKey: 'development',
    value: 25
  },
  {
    aggregateKey: 'security',
    value: 75
  }
];

export const contributorsScoreData: ScoreData[] = [
  {
    benchmarkKey: BenchmarkKeys.Retention,
    value: 1
  },
  {
    benchmarkKey: BenchmarkKeys.ActiveContributors,
    value: 4
  },
  {
    benchmarkKey: BenchmarkKeys.ContributorDependency,
    value: 14
  },
  {
    benchmarkKey: BenchmarkKeys.OrganizationDependency,
    value: 15
  },
  {
    benchmarkKey: BenchmarkKeys.GeographicalDistribution,
    value: 0
  }
];

export const popularityScoreData: ScoreData[] = [
  {
    benchmarkKey: BenchmarkKeys.Stars,
    value: 510
  },
  {
    benchmarkKey: BenchmarkKeys.Forks,
    value: 24
  }
];

export const developmentScoreData: ScoreData[] = [
  {
    benchmarkKey: BenchmarkKeys.IssuesResolution,
    value: 15
  },
  {
    benchmarkKey: BenchmarkKeys.PullRequests,
    value: 1
  },
  {
    benchmarkKey: BenchmarkKeys.ActiveDays,
    value: 29
  },
  {
    benchmarkKey: BenchmarkKeys.MergeLeadTime,
    value: 14
  }
];
