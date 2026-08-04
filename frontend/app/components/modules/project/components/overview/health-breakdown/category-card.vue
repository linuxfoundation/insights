<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="p-4 flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <lfx-icon
        :name="props.icon"
        type="regular"
        :size="16"
        class="text-neutral-500"
      />
      <span class="text-sm font-semibold text-neutral-900">{{ props.name }}</span>
    </div>
    <span
      v-if="props.score !== null"
      class="text-xs text-neutral-500"
      >{{ props.score }}/{{ props.maxScore }}</span
    >
    <span
      v-else
      class="text-xs text-neutral-400"
      >No data</span
    >
    <lfx-progress-bar
      :values="[progressPercent]"
      color="normal"
      size="small"
    />
  </lfx-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';

const props = defineProps<{
  name: string;
  icon: string;
  score: number | null;
  maxScore: number;
}>();

const progressPercent = computed(() => {
  if (props.score === null || props.maxScore === 0) return 0;
  return (props.score / props.maxScore) * 100;
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthBreakdownCategoryCard',
};
</script>
