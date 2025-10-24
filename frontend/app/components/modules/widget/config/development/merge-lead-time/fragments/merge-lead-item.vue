<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col">
    <div class="flex flex-row gap-3 items-start justify-end">
      <div
        v-if="!!props.itemValue"
        class="flex gap-2 items-center text-sm h-6 px-2.5 py-1 rounded-full font-semibold bg-neutral-50 text-neutral-600"
      >
        {{ itemDisplay }}
      </div>
      <lfx-tooltip
        v-else
        :content="itemDisplay === '-' ? 'Merge time could not be calculated for this stage.' : ''"
      >
        <div
          class="flex gap-2 items-center text-sm h-6 px-2.5 py-1 rounded-full font-semibold bg-neutral-50 text-neutral-600"
        >
          {{ itemDisplay }}
        </div>
      </lfx-tooltip>

      <div>
        <lfx-icon
          v-if="!!props.itemValue"
          name="arrow-down"
          class="text-neutral-300"
          :size="24"
        />
      </div>
    </div>
    <div class="flex flex-row gap-4 items-center justify-between">
      <div class="h-8 w-8 bg-neutral-100 rounded-full flex items-center justify-center relative">
        <lfx-icon
          :name="icon"
          :size="16"
        />
      </div>
      <div class="flex flex-row grow items-center gap-3">
        <div class="text-sm text-neutral-900 font-semibold">{{ title }}</div>
        <div class="border-b border-dashed border-neutral-300 grow" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { MergeLeadTimeItem } from '~~/types/development/responses.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    icon: string;
    itemValue: MergeLeadTimeItem | undefined;
    isLast?: boolean;
  }>(),
  {
    isLast: false,
  },
);

const itemDisplay = computed(() =>
  props.itemValue ? `${props.itemValue?.value} ${props.itemValue?.unit}` : '-',
);
</script>
