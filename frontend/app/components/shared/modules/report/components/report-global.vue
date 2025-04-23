<template>
  <lfx-report-modal
    v-if="isReportModalOpen"
    v-model="isReportModalOpen"
  />
</template>

<script lang="ts" setup>

import {storeToRefs} from "pinia";
import {useReportStore} from "~/components/shared/modules/report/store/report.store";
import LfxReportModal from "~/components/shared/modules/report/components/report-modal.vue";

const {isReportModalOpen} = storeToRefs(useReportStore())
</script>

<script lang="ts">
export default {
  name: 'LfxReportGlobal',
};
</script>
