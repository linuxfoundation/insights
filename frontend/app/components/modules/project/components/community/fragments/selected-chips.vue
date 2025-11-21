<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center gap-2">
    <div
      v-for="item in displayedItems"
      :key="item.value"
      class="bg-neutral-100 rounded-full px-1.5 py-0.5 flex items-center gap-1 min-w-0 max-w-50"
    >
      <slot
        name="chip"
        :item="item"
      >
        <span class="text-xs leading-4 text-neutral-900 truncate">
          {{ item.label }}
        </span>
      </slot>
    </div>
    <div
      v-if="remainingCount > 0"
      class="bg-neutral-100 rounded-full px-1.5 py-0.5"
    >
      <span class="text-xs leading-4 text-neutral-900"> +{{ remainingCount }} </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface SelectedChipItem {
  value: string;
  label: string;
  image?: string;
  icon?: string;
  iconClass?: string;
}

const props = withDefaults(
  defineProps<{
    items: SelectedChipItem[];
    maxDisplayed?: number;
  }>(),
  {
    maxDisplayed: 2,
  },
);

const displayedItems = computed(() => props.items.slice(0, props.maxDisplayed));

const remainingCount = computed(() => Math.max(0, props.items.length - props.maxDisplayed));
</script>

<script lang="ts">
export default {
  name: 'LfxCommunitySelectedChips',
};
</script>
