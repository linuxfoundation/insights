<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="isError"
    class="flex flex-col items-center justify-center py-10 gap-2"
  >
    <lfx-icon
      name="eyes"
      :size="40"
      class="text-neutral-300"
    />
    <p class="text-sm text-neutral-500">No data available</p>
  </div>
  <div
    v-else
    class="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
  >
    <div
      v-for="kpi in kpiCards"
      :key="kpi.label"
      class="bg-neutral-50 rounded-lg p-3 md:p-4 flex flex-col gap-1"
    >
      <div class="text-body-2 text-neutral-500">{{ kpi.label }}</div>
      <div v-if="isLoading">
        <lfx-skeleton
          height="32px"
          width="80%"
        />
      </div>
      <span
        v-else
        class="text-heading-3 md:text-heading-2 font-bold text-neutral-900"
      >
        {{ kpi.value }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

defineProps<{
  kpiCards: { label: string; value: string }[];
  isLoading: boolean;
  isError: boolean;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreCoverageKpiRow',
};
</script>
