// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  CncfGeoDistributionOverTimeResponse,
  CncfGeoDistributionOverTimeQueryParams,
  CncfGeoDistributionResponse,
  CncfGeoDistributionQueryParams,
} from '~~/types/report/cncf.types';

const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 2; // 2 hours

class CncfReportApiService {
  fetchGeoDistributionOverTime(params: ComputedRef<CncfGeoDistributionOverTimeQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.CNCF_GEO_TIMESERIES,
      params.value.collection,
      params.value.startDate,
      params.value.endDate,
      params.value.granularity,
    ]);

    const queryFn = computed<QueryFunction<CncfGeoDistributionOverTimeResponse>>(() => async () => {
      return await $fetch('/api/report/cncf/geo-distribution-over-time', {
        params: {
          collection: params.value.collection,
          granularity: params.value.granularity,
          startDate: params.value.startDate,
          endDate: params.value.endDate,
        },
      });
    });

    return useQuery<CncfGeoDistributionOverTimeResponse>({
      queryKey,
      queryFn,
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchGeoDistribution(params: ComputedRef<CncfGeoDistributionQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.CNCF_GEO_DISTRIBUTION,
      params.value.collection,
      params.value.startDate,
      params.value.endDate,
    ]);

    const queryFn = computed<QueryFunction<CncfGeoDistributionResponse>>(() => async () => {
      return await $fetch('/api/report/cncf/geo-distribution', {
        params: {
          collection: params.value.collection,
          startDate: params.value.startDate,
          endDate: params.value.endDate,
        },
      });
    });

    return useQuery<CncfGeoDistributionResponse>({
      queryKey,
      queryFn,
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }
}

export const CNCF_REPORT_API_SERVICE = new CncfReportApiService();
