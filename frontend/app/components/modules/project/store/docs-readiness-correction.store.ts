// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useAuth } from '~~/composables/useAuth';
import type { DocsReadinessState } from '~~/types/docs-readiness/readiness.types';

export type { DocsReadinessState };

export interface DocsReadinessCorrectionContext {
  projectSlug: string;
  projectName: string;
  currentDocsUrl: string | null;
  state: DocsReadinessState;
}

export const useDocsReadinessCorrectionStore = defineStore('docsReadinessCorrection', () => {
  const isCorrectionModalOpen = ref(false);
  const correctionContext = ref<DocsReadinessCorrectionContext | null>(null);

  const { isAuthenticated, login } = useAuth();

  const openCorrection = (context: DocsReadinessCorrectionContext) => {
    if (!isAuthenticated.value) {
      login(window.location.pathname + window.location.search + window.location.hash);
      return;
    }

    correctionContext.value = context;
    isCorrectionModalOpen.value = true;
  };

  const closeCorrection = () => {
    isCorrectionModalOpen.value = false;
    correctionContext.value = null;
  };

  return {
    isCorrectionModalOpen,
    correctionContext,
    openCorrection,
    closeCorrection,
  };
});
