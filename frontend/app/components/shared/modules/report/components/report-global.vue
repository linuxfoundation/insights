<template>
  <lfx-report-modal
    v-if="isReportModalOpen"
    v-model="isReportModalOpen"
    :defaults="reportDataDefaults"
  />
</template>

<script lang="ts" setup>

import {storeToRefs} from "pinia";
import {useReportStore} from "~/components/shared/modules/report/store/report.store";
import LfxReportModal from "~/components/shared/modules/report/components/report-modal.vue";

const {isReportModalOpen,reportDataDefaults } = storeToRefs(useReportStore())
</script>

<script lang="ts">
export default {
  name: 'LfxReportGlobal',
};
</script>
