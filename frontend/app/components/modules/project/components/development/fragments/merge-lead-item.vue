<template>
  <div class="flex flex-row gap-4 items-center justify-between">
    <div class="h-8 w-8 bg-neutral-100 rounded-full flex items-center justify-center relative">
      <span class="absolute -top-6 left-[50%] h-6 border-l border-neutral-300 border-dashed -ml-[1px]" />
      <lfx-icon
        :name="icon"
        :size="16"
      />
      <span
        v-if="!isLast"
        class="absolute -bottom-5 left-[50%] h-5 border-l border-neutral-300 border-dashed -ml-[1px]"
      />
    </div>
    <div class="flex flex-col grow">
      <div class="text-sm text-neutral-900 font-medium">{{ title }}</div>
      <div class="text-xs text-neutral-400">{{ description }}</div>
    </div>
    <div
      class="flex gap-2 items-center text-sm h-6 px-2.5 py-1 rounded-full"
      :class="valueClass"
    >
      <lfx-icon
        :name="itemValue.changeType === 'positive' ? 'thumbs-up' : 'thumbs-down'"
        :size="14"
      />
      {{ itemValue.value }}
      {{ itemValue.unit }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { MergeLeadTimeItem } from '../types/merge-lead-time.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    icon: string;
    itemValue: MergeLeadTimeItem;
    isLast?: boolean;
  }>(),
  {
    isLast: false
  }
);

const valueClass = computed(//
  () => (props.itemValue.changeType === 'positive'
    ? 'bg-positive-50 text-positive-600'
    : 'bg-negative-50 text-negative-600')
);
</script>
