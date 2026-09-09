// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone query function for the "Availability of each signal" widget (IN-1290), written as a
// plain exported function rather than a method on the shared HEALTH_SCORE_COVERAGE_API_SERVICE
// class - that class is created by IN-1285 and it isn't IN-1290's turn to edit it yet. This will
// become a `fetchSignalAvailability(scope)` method on the shared service in the wiring follow-up.
//
// TANSTACK_KEY below matches the value the shared TanstackKey enum will get
// (`TanstackKey.HEALTH_SCORE_COVERAGE_SIGNAL_AVAILABILITY`) once this widget is wired in.

import type { QueryFunction } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type {
  HealthScoreCoverageScope,
  HealthScoreCoverageSignalAvailabilityData,
} from '~~/types/report/health-score-coverage-signal-availability.types';

const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 24; // 24 hours

const TANSTACK_KEY = 'health-score-coverage-signal-availability';

export function fetchHealthScoreCoverageSignalAvailabilityQuery(
  scope: ComputedRef<HealthScoreCoverageScope>,
) {
  const queryKey = computed(() => [TANSTACK_KEY, scope.value]);
  const queryFn: QueryFunction<HealthScoreCoverageSignalAvailabilityData> = () =>
    $fetch<HealthScoreCoverageSignalAvailabilityData>(
      '/api/report/health-score-coverage/signal-availability',
      { params: { scope: scope.value } },
    );

  return useQuery<HealthScoreCoverageSignalAvailabilityData>({
    queryKey,
    queryFn,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}
