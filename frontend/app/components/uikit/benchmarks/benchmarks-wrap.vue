<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="c-benchmarks-wrap max-lg:c-card">
    <div class="max-lg:w-full w-2/3">
      <slot />
    </div>
    <div class="c-benchmark-component">
      <lfx-benchmark
        v-if="isVisible"
        :type="type"
      >
        {{ benchmarkText }}
      </lfx-benchmark>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { WidgetBenchmarkConfig } from '~~/app/components/modules/widget/config/widget.config';
import LfxBenchmark from '~/components/uikit/benchmarks/benchmarks.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import { dateOptKeys } from '~/components/modules/project/config/date-options';

const props = withDefaults(defineProps<{
  benchmarkConfig?: WidgetBenchmarkConfig | undefined;
  point: number;
  widgetModel: Record<string, number | boolean | string>;
}>(), {
  benchmarkConfig: undefined
});

const { selectedTimeRangeKey, startDate, endDate } = storeToRefs(useProjectStore())

// const benchmarkConfig = computed(() => benchmarkConfigs.find((config) => config.key === props.benchmark?.key));
// const benchmarkValue = computed(() => Math.ceil(props.benchmark?.value || 0));
// const points = computed(() => benchmarkConfig.value?.points
//   .find((point) => benchmarkValue.value >= point.pointStart
//   && (point.pointEnd === null || benchmarkValue.value <= point.pointEnd)));
const pointDetails = computed(() => props.benchmarkConfig?.points[props.point]);
const type = computed(() => (pointDetails.value ? pointDetails.value.type : 'negative'));
const benchmarkText = computed(() => (pointDetails.value ? pointDetails.value.text : ''));

const isVisible = computed(() => (props.benchmarkConfig ? props.benchmarkConfig.isVisible(
  props.widgetModel,
  selectedTimeRangeKey.value as dateOptKeys,
  startDate.value || '',
  endDate.value || ''
) : false));
</script>

<script lang="ts">
export default {
  name: 'LfxBenchmarksWrap'
};
</script>
