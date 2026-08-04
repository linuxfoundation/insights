<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white border border-neutral-100 rounded-xl shadow-xl overflow-hidden px-2 py-3 w-80">
    <div class="px-2">
      <p class="text-xs leading-4 font-semibold text-neutral-500">Health Score</p>
    </div>
    <div class="flex flex-col gap-2 mt-3 px-2 pb-1">
      <div class="flex items-center justify-between">
        <span class="text-xs leading-5 text-neutral-900">
          <span class="font-semibold">Overall</span>
          <span class="font-normal">・{{ healthLabelDisplay }}</span>
        </span>
        <span class="text-xs font-semibold text-neutral-900">{{ props.project.healthScoreV2 ?? '-' }}/100</span>
      </div>
      <lfx-progress-bar
        size="small"
        :values="[props.project.healthScoreV2 ?? 0]"
        :color="getColor(props.project.healthScoreV2)"
      />
      <div
        v-if="props.project.lifecycleLabel"
        class="flex items-center justify-between mt-1"
      >
        <span class="text-xs leading-5 text-neutral-900 font-semibold">Lifecycle</span>
        <span class="text-xs leading-5 text-neutral-500 capitalize">{{ props.project.lifecycleLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import type { ProgressBarType } from '~/components/uikit/progress-bar/types/progress-bar.types';
import type { ProjectInsights } from '~~/types/project';

const props = defineProps<{
  project: ProjectInsights;
}>();

const healthLabelDisplay = computed(() => {
  const label = props.project.healthLabel;
  if (!label) return 'Unavailable';
  return label.charAt(0).toUpperCase() + label.slice(1);
});

const getColor = (score: number | null): ProgressBarType => {
  if (!score) return 'negative';
  switch (true) {
    case score >= 75:
      return 'positive';
    case score >= 25:
      return 'warning';
    default:
      return 'negative';
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreDetails',
};
</script>
