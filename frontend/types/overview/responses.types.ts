// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { BenchmarkKeys } from '../shared/benchmark.types';

export interface TrustScoreSummary {
  overall: number;
  popularity: number;
  contributors: number;
  security: number;
  development: number;
}

export interface HealthScore {
  key: BenchmarkKeys;
  value: number; // this contains the actual value, not the calculated score
  points?: number;
}
