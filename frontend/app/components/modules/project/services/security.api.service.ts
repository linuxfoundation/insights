// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { SecurityData } from '~~/types/security/responses.types';
export interface SecurityAssessmentQueryParams {
  projectSlug: string;
  repos?: string[];
}

class SecurityApiService {
  fetchSecurityAssessment(params: ComputedRef<SecurityAssessmentQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.SECURITY_ASSESSMENT,
      params.value.projectSlug,
      params.value.repos,
    ]);

    const queryFn = this.securityAssessmentQueryFn(params);

    return useQuery<SecurityData[]>({
      queryKey,
      queryFn,
    });
  }

  securityAssessmentQueryFn(
    params: ComputedRef<SecurityAssessmentQueryParams>,
  ): QueryFunction<SecurityData[]> {
    return async () => {
      const { projectSlug, repos } = params.value;

      return await $fetch(`/api/project/${projectSlug}/security/assessment`, {
        params: { repos },
      });
    };
  }
}

export const SECURITY_API_SERVICE = new SecurityApiService();
