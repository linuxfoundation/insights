// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useQuery } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';

import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  DocsCorrectionContext,
  DocsCorrectionRequest,
} from '~~/types/docs-readiness/correction.types';
import type {
  DocsReadinessChecks,
  DocsReadinessHistory,
  DocsReadinessSummary,
} from '~~/types/docs-readiness/readiness.types';

class DocsReadinessApiService {
  fetchSummary(slug: ComputedRef<string>) {
    const queryKey = computed(() => [TanstackKey.DOCS_READINESS_SUMMARY, slug.value]);

    return useQuery<DocsReadinessSummary>({
      queryKey,
      queryFn: () => $fetch(`/api/project/${slug.value}/docs-readiness/summary`),
    });
  }

  fetchHistory(slug: ComputedRef<string>) {
    const queryKey = computed(() => [TanstackKey.DOCS_READINESS_HISTORY, slug.value]);

    return useQuery<DocsReadinessHistory>({
      queryKey,
      queryFn: () => $fetch(`/api/project/${slug.value}/docs-readiness/history`),
    });
  }

  fetchChecks(slug: ComputedRef<string>) {
    const queryKey = computed(() => [TanstackKey.DOCS_READINESS_CHECKS, slug.value]);

    return useQuery<DocsReadinessChecks>({
      queryKey,
      queryFn: () => $fetch(`/api/project/${slug.value}/docs-readiness/checks`),
    });
  }

  fetchCorrectionContext(slug: ComputedRef<string>, enabled?: ComputedRef<boolean>) {
    const queryKey = computed(() => [TanstackKey.DOCS_READINESS_CORRECTION_CONTEXT, slug.value]);

    return useQuery<DocsCorrectionContext>({
      queryKey,
      queryFn: () => $fetch(`/api/project/${slug.value}/docs-readiness/correction-context`),
      enabled,
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
