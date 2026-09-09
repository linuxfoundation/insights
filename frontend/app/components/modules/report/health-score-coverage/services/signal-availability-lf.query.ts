// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Standalone query function for the "Signal availability inside and outside the Linux Foundation"
// widget (IN-1291), written as a plain exported function rather than a method on the shared
// HEALTH_SCORE_COVERAGE_API_SERVICE class - that class is created by IN-1285 and it isn't
// IN-1291's turn to edit it yet. This will become a `fetchSignalAvailabilityLf()` method on the
// shared service in the wiring follow-up.
//
// TANSTACK_KEY below matches the value the shared TanstackKey enum will get
// (`TanstackKey.HEALTH_SCORE_COVERAGE_SIGNAL_AVAILABILITY_LF`) once this widget is wired in.

import type { QueryFunction } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';
import type { HealthScoreCoverageSignalAvailabilityLfData } from '~~/types/report/health-score-coverage-signal-availability-lf.types';

const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 24; // 24 hours

const TANSTACK_KEY = 'health-score-coverage-signal-availability-lf';

export function fetchHealthScoreCoverageSignalAvailabilityLfQuery() {
  const queryFn: QueryFunction<HealthScoreCoverageSignalAvailabilityLfData> = () =>
    $fetch<HealthScoreCoverageSignalAvailabilityLfData>(
      '/api/report/health-score-coverage/signal-availability-lf',
    );

  return useQuery<HealthScoreCoverageSignalAvailabilityLfData>({
    queryKey: [TANSTACK_KEY],
    queryFn,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}
