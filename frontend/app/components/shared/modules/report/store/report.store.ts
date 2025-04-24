import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {ReportDataForm} from "~/components/shared/modules/report/types/report.types";

export const useReportStore = defineStore('report', () => {
    const isReportModalOpen = ref(false);
    const reportDataDefaults = ref<Partial<ReportDataForm>>({});
    const openReportModal = (defaults: Partial<ReportDataForm> = {}) => {
        reportDataDefaults.value = defaults;
        isReportModalOpen.value = true;
    };

    return {
        isReportModalOpen,
        reportDataDefaults,
        openReportModal,
    };
});
