// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ReportDataForm } from '~/components/shared/modules/report/types/report.types';
import { useAuth } from '~~/composables/useAuth';

export const useReportStore = defineStore('report', () => {
  const isReportModalOpen = ref(false);
  const reportDataDefaults = ref<Partial<ReportDataForm>>({});

  const { isAuthenticated, login } = useAuth();

  const openReportModal = (defaults: Partial<ReportDataForm> = {}) => {
    if (!isAuthenticated.value) {
      login(window.location.pathname + window.location.search + window.location.hash);
      return;
    }

    reportDataDefaults.value = defaults;
    isReportModalOpen.value = true;
  };

  return {
    isReportModalOpen,
    reportDataDefaults,
    openReportModal,
  };
});
