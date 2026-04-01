// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  AiCodeTrackerResponse,
  AiCodeTrackerQueryParams,
} from '~~/types/report/ai-code-tracker.types';

const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 2; // 2 hours

class AiCodeTrackerApiService {
  fetchAiCodeTrackerData(params: ComputedRef<AiCodeTrackerQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.AI_CODE_TRACKER,
      params.value.granularity,
      params.value.startDate,
      params.value.endDate,
    ]);

    const queryFn = computed<QueryFunction<AiCodeTrackerResponse>>(() => async () => {
      return await $fetch('/api/report/ai-code-tracker', {
        params: {
          granularity: params.value.granularity,
          startDate: params.value.startDate,
          endDate: params.value.endDate,
        },
      });
    });

    return useQuery<AiCodeTrackerResponse>({
      queryKey,
      queryFn,
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }
}

export const AI_CODE_TRACKER_API_SERVICE = new AiCodeTrackerApiService();
