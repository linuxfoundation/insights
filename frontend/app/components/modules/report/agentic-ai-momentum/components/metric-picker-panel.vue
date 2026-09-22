<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white border border-neutral-200 rounded shadow-lg p-4 w-[340px] max-h-[80vh] overflow-y-auto">
    <!-- None option -->
    <div
      v-if="showNone"
      class="mb-4"
    >
      <label
        class="flex items-center gap-2 cursor-pointer text-body-2 select-none w-full"
        :class="selected === null ? 'text-primary-600 font-medium' : 'text-neutral-700 hover:text-neutral-900'"
      >
        <lfx-checkbox
          :model-value="selected === null"
          @update:model-value="$emit('select-none')"
        />
        None
      </label>
    </div>

    <!-- Grouped metrics -->
    <div
      v-for="group in groups"
      :key="group"
      class="mb-4 last:mb-0"
    >
      <p class="text-xs uppercase tracking-wide text-neutral-400 font-semibold mb-2">
        {{ group }}
      </p>
      <div class="grid grid-cols-2 gap-x-4 gap-y-2">
        <label
          v-for="opt in config.filter((c) => c.group === group)"
          :key="opt.key"
          class="flex items-center gap-2 cursor-pointer text-body-2 select-none w-full"
          :class="selected === opt.key ? 'text-primary-600 font-medium' : 'text-neutral-700 hover:text-neutral-900'"
        >
          <lfx-checkbox
            :model-value="selected === opt.key"
            @update:model-value="$emit('select', opt.key)"
          />
          {{ opt.label }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue';
import type { MetricKey, MetricOption, MetricGroup } from '~~/types/report/agentic-ai-momentum.types';

defineProps<{
  config: MetricOption[];
  groups: MetricGroup[];
  selected: MetricKey | null;
  showNone?: boolean;
}>();

defineEmits<{
  select: [key: MetricKey];
  'select-none': [];
}>();
</script>

<script lang="ts">
export default {
  name: 'MetricPickerPanel',
};
</script>
