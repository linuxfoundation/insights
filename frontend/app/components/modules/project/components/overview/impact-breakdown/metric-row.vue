<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 [&:not(:last-child)]:border-b border-neutral-100"
  >
    <div>
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-semibold text-neutral-900">{{ props.name }}</span>
        <lfx-tag
          v-if="props.band"
          variation="positive"
          size="small"
          >{{ props.band }}</lfx-tag
        >
        <lfx-tag
          v-else
          variation="default"
          size="small"
          >No data</lfx-tag
        >
      </div>
      <span
        v-if="props.signalType"
        class="text-xs text-neutral-400"
        >{{ props.signalType }} signal</span
      >
      <p class="text-xs text-neutral-500 mt-1">
        {{ props.description }}
      </p>
    </div>
    <span class="text-sm font-semibold text-neutral-900 shrink-0">
      {{ props.value !== null ? formatNumberShort(props.value) : '—' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import LfxTag from '~/components/uikit/tag/tag.vue';
import { formatNumberShort } from '~/components/shared/utils/formatter';

const props = defineProps<{
  name: string;
  description: string;
  value: number | null;
  band: string | null;
  signalType?: 'Primary' | 'Secondary' | null;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxImpactBreakdownMetricRow',
};
</script>
