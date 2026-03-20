// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  CncfGeoTimeseriesResponse,
  CncfGeoTimeseriesQueryParams,
} from '~~/types/report/cncf.types';

class CncfReportApiService {
  fetchGeoTimeseries(params: ComputedRef<CncfGeoTimeseriesQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.CNCF_GEO_TIMESERIES,
      params.value.startDate,
      params.value.endDate,
      params.value.granularity,
      params.value.limit,
    ]);
    const queryFn = computed<QueryFunction<CncfGeoTimeseriesResponse>>(() =>
      this.geoTimeseriesQueryFn(() => ({
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        granularity: params.value.granularity,
        limit: params.value.limit,
      })),
    );

    return useQuery<CncfGeoTimeseriesResponse>({
      queryKey,
      queryFn,
    });
  }

  geoTimeseriesQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<CncfGeoTimeseriesResponse> {
    const { startDate, endDate, granularity, limit } = query();
    return async () => {
      return await $fetch('/api/report/cncf/geo-distribution', {
        params: {
          startDate,
          endDate,
          granularity,
          limit,
        },
      });
    };
  }
}

export const CNCF_REPORT_API_SERVICE = new CncfReportApiService();
