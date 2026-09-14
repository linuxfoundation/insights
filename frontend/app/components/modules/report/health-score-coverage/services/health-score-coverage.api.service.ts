// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { HealthScoreCoverageGlanceData } from '~~/types/report/health-score-coverage.types';

const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 24; // 24 hours

class HealthScoreCoverageApiService {
  fetchGlance() {
    return useQuery<HealthScoreCoverageGlanceData>({
      queryKey: [TanstackKey.HEALTH_SCORE_COVERAGE_GLANCE],
      queryFn: () =>
        $fetch<HealthScoreCoverageGlanceData>('/api/report/health-score-coverage/glance'),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }
}

export const HEALTH_SCORE_COVERAGE_API_SERVICE = new HealthScoreCoverageApiService();
