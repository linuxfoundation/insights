<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-row gap-4">
    <div>
      <div
        :class="iconBGColor"
        class="rounded-full h-6 w-6 flex items-center justify-center"
      >
        <lfx-benchmark-icon
          :type="pointDetails?.type || 'positive'"
          use-triangle
          :size="12"
        />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div class="text-sm font-semibold text-neutral-900">
        {{ title }}
      </div>
      <div class="text-xs text-neutral-500">
        {{ description }}
      </div>
    </div>
    <!-- need to add this because tailwind won't import them in the computed property -->
    <span class="bg-negative-100 bg-positive-100 bg-warning-100" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxBenchmarkIcon from '~/components/uikit/benchmarks/benchmark-icon.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import { lfxWidgets } from '~/components/modules/widget/config/widget.config';

const props = defineProps<{
  widgetKey: string;
  value: number;
  benchmark: number;
}>();

const widget = computed(() => Object.values(lfxWidgets).find(w => w.key === props.widgetKey));
const title = computed(() => widget.value?.benchmark?.title);
const benchmarkValue = computed(() => Math.ceil(props.value || 0));
const pointDetails = computed(() => widget.value?.benchmark?.points[props.benchmark]);
const description = computed(() => `
  ${pointDetails.value?.description.replace('{value}', formatNumber(benchmarkValue.value || 0).toString())} 
  - ${pointDetails.value?.text}`);
const iconBGColor = computed(() => `bg-${pointDetails.value?.type}-100`);

</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreItem'
};
</script>
