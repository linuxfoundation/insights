// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useQuery } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';

import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  CncfCountryComparisonResponse,
  CncfCountryOrganizationsResponse,
  CncfCountryProjectsResponse,
  CncfCountryQueryParams,
  CncfCountrySummary,
  CncfCountryTimeseriesQueryParams,
  CncfCountryTimeseriesResponse,
} from '~~/types/report/cncf-country.types';

const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 2; // 2 hours

function useCountryQuery<T>(
  key: TanstackKey,
  url: string,
  params: ComputedRef<Record<string, string | number | null | undefined>>,
) {
  return useQuery<T>({
    queryKey: computed(() => [key, params.value]),
    queryFn: () => $fetch<T>(url, { params: params.value }),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

class CncfCountryReportApiService {
  fetchSummary(params: ComputedRef<CncfCountryQueryParams>) {
    return useCountryQuery<CncfCountrySummary>(
      TanstackKey.CNCF_COUNTRY_SUMMARY,
      '/api/report/cncf/country/summary',
      computed(() => ({ ...params.value })),
    );
  }

  fetchTimeseries(params: ComputedRef<CncfCountryTimeseriesQueryParams>) {
    return useCountryQuery<CncfCountryTimeseriesResponse>(
      TanstackKey.CNCF_COUNTRY_TIMESERIES,
      '/api/report/cncf/country/timeseries',
      computed(() => ({ ...params.value })),
    );
  }

  fetchProjects(params: ComputedRef<CncfCountryQueryParams & { limit: number }>) {
    return useCountryQuery<CncfCountryProjectsResponse>(
      TanstackKey.CNCF_COUNTRY_PROJECTS,
      '/api/report/cncf/country/projects',
      computed(() => ({ ...params.value })),
    );
  }

  fetchOrganizations(params: ComputedRef<CncfCountryQueryParams & { limit: number }>) {
    return useCountryQuery<CncfCountryOrganizationsResponse>(
      TanstackKey.CNCF_COUNTRY_ORGANIZATIONS,
      '/api/report/cncf/country/organizations',
      computed(() => ({ ...params.value })),
    );
  }

  fetchComparison(params: ComputedRef<CncfCountryTimeseriesQueryParams>) {
    return useCountryQuery<CncfCountryComparisonResponse>(
      TanstackKey.CNCF_COUNTRY_COMPARISON,
      '/api/report/cncf/country/comparison',
      computed(() => ({ ...params.value })),
    );
  }
}

export const CNCF_COUNTRY_REPORT_API_SERVICE = new CncfCountryReportApiService();
