// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// import { type Benchmark } from '~~/components/uikit/benchmarks/types/benchmark.types';

import { contributorDependency } from './configs/contributor-dependency';
import { activeContributors } from './configs/active-contributors';
import { organizationDependency } from './configs/organization-dependency';
import { retention } from './configs/retention';
import { stars } from './configs/stars';
import { forks } from './configs/forks';
import { issuesResolution } from './configs/issues-resolution';
import { activeDays } from './configs/active-days';
import { mergeLeadTime } from './configs/merge-lead-time';
import { pullRequests } from './configs/pull-requests';
import { contributionOutsideWorkHours } from './configs/contribution-outside-work-hours';
import type { BenchmarkConfigs } from '~~/types/shared/benchmark.types';

export const benchmarkConfigs: BenchmarkConfigs[] = [
  activeContributors,
  contributorDependency,
  organizationDependency,
  retention,
  stars,
  forks,
  issuesResolution,
  activeDays,
  mergeLeadTime,
  pullRequests,
  contributionOutsideWorkHours
];
