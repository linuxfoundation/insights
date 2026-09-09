// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone query function for the "Health score bands" widget (IN-1286), written as a plain
// exported function rather than a method on the shared HEALTH_SCORE_COVERAGE_API_SERVICE class -
// that class is created by IN-1285 and it isn't IN-1286's turn to edit it yet. This will become a
// `fetchBands(scope)` method on the shared service in the wiring follow-up.
//
// TANSTACK_KEY below matches the value the shared TanstackKey enum will get
// (`TanstackKey.HEALTH_SCORE_COVERAGE_BANDS`) once this widget is wired in.

import type { QueryFunction } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type {
  HealthScoreCoverageBandsData,
  HealthScoreCoverageScope,
} from '~~/types/report/health-score-coverage-bands.types';

const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 24; // 24 hours

const TANSTACK_KEY = 'health-score-coverage-bands';

export function fetchHealthScoreCoverageBandsQuery(scope: ComputedRef<HealthScoreCoverageScope>) {
  const queryKey = computed(() => [TANSTACK_KEY, scope.value]);
  const queryFn: QueryFunction<HealthScoreCoverageBandsData> = () =>
    $fetch<HealthScoreCoverageBandsData>('/api/report/health-score-coverage/bands', {
      params: { scope: scope.value },
    });

  return useQuery<HealthScoreCoverageBandsData>({
    queryKey,
    queryFn,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}
