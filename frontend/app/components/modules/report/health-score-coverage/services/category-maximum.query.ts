// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone query function for the "Repositories scoring full marks" widget (IN-1292), written
// as a plain exported function rather than a method on the shared
// HEALTH_SCORE_COVERAGE_API_SERVICE class - that class is created by IN-1285 and it isn't
// IN-1292's turn to edit it yet. This will become a `fetchCategoryMaximum()` method on the shared
// service in the wiring follow-up.
//
// TANSTACK_KEY below matches the value the shared TanstackKey enum will get
// (`TanstackKey.HEALTH_SCORE_COVERAGE_CATEGORY_MAXIMUM`) once this widget is wired in.

import type { QueryFunction } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';
import type { HealthScoreCoverageCategoryMaximumData } from '~~/types/report/health-score-coverage-category-maximum.types';

const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 24; // 24 hours

const TANSTACK_KEY = 'health-score-coverage-category-maximum';

export function fetchHealthScoreCoverageCategoryMaximumQuery() {
  const queryFn: QueryFunction<HealthScoreCoverageCategoryMaximumData> = () =>
    $fetch<HealthScoreCoverageCategoryMaximumData>(
      '/api/report/health-score-coverage/category-maximum',
    );

  return useQuery<HealthScoreCoverageCategoryMaximumData>({
    queryKey: [TANSTACK_KEY],
    queryFn,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}
