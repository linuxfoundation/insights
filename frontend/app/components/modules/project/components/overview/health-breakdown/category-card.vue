<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <button
    type="button"
    class="flex-1 min-w-0 flex flex-col gap-4 items-start p-4 rounded-md text-left transition-colors"
    :class="
      props.selected
        ? 'c-card !border-transparent !shadow-md !rounded-md'
        : 'bg-transparent border border-transparent hover:bg-white/60'
    "
    @click="emit('select')"
  >
    <div class="flex flex-col gap-2 items-start w-full">
      <lfx-progress-bar
        :values="[progressPercent]"
        :color="props.color"
        size="small"
        class="w-full"
      />
      <lfx-icon
        :name="props.icon"
        type="light"
        :size="16"
        class="text-neutral-900"
      />
    </div>

    <div class="flex items-start justify-between w-full gap-2">
      <span
        class="text-sm text-neutral-900"
        :class="props.selected ? 'font-semibold' : 'font-medium'"
        >{{ props.name }}</span
      >
      <span
        v-if="props.score !== null"
        class="text-xs shrink-0"
      >
        <span class="text-neutral-900">{{ props.score }}</span
        ><span class="text-neutral-400">/{{ props.maxScore }}</span>
      </span>
      <span
        v-else
        class="text-xs text-neutral-400 shrink-0"
        >No data</span
      >
    </div>

    <p class="text-xs text-neutral-600 w-full">
      {{ props.description }}
    </p>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import type { ProgressBarType } from '~/components/uikit/progress-bar/types/progress-bar.types';

const props = defineProps<{
  name: string;
  icon: string;
  score: number | null;
  maxScore: number;
  color: ProgressBarType;
  description: string;
  selected: boolean;
}>();

const emit = defineEmits<{
  select: [];
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
