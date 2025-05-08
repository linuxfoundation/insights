import type { ScoreData } from '~~/types/shared/benchmark.types';
import { BenchmarkKeys } from '~~/types/shared/benchmark.types';
import type { TrustScoreSummary } from '~~/types/overview/responses.types';

export const trustScoreSummary: TrustScoreSummary = {
  overall: 76,
  popularity: 50,
  contributors: 100,
  security: 75,
  development: 25
};

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
