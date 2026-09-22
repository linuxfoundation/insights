<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-report-modal
    v-if="isReportModalOpen"
    v-model="isReportModalOpen"
    :defaults="reportDataDefaults"
  />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import LfxReportModal from '~/components/shared/modules/report/components/report-modal.vue';
import { useReportStore } from '~/components/shared/modules/report/store/report.store';

const { isReportModalOpen, reportDataDefaults } = storeToRefs(useReportStore());
</script>

<script lang="ts">
export default {
  name: 'LfxReportGlobal',
};
</script>
