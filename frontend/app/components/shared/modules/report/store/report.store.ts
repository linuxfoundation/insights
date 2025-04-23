import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useReportStore = defineStore('report', () => {
  const isReportModalOpen = ref(false);
    const openReportModal = () => {
      console.log('openReportModal');
        isReportModalOpen.value = true;
    };

  return {
    isReportModalOpen,
    openReportModal,
  };
});
