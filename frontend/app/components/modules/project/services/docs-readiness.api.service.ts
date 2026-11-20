// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useQuery } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';

import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  DocsCorrectionContext,
  DocsCorrectionRequest,
} from '~~/types/docs-readiness/correction.types';

class DocsReadinessApiService {
  fetchCorrectionContext(slug: ComputedRef<string>) {
    const queryKey = computed(() => [TanstackKey.DOCS_READINESS_CORRECTION_CONTEXT, slug.value]);

    return useQuery<DocsCorrectionContext>({
      queryKey,
      queryFn: () => $fetch(`/api/project/${slug.value}/docs-readiness/correction-context`),
    });
  }

  async submitCorrection(request: DocsCorrectionRequest): Promise<string> {
    return await $fetch<string>('/api/report/docs-url-correction', {
      method: 'POST',
      body: request,
    });
  }
}

export const DOCS_READINESS_API_SERVICE = new DocsReadinessApiService();
