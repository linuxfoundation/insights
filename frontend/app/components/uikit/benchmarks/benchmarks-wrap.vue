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
import type { Benchmark } from '~~/types/shared/benchmark.types';
import LfxBenchmark from '~/components/uikit/benchmarks/benchmarks.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import { benchmarkConfigs } from '~~/app/config/benchmarks';

const props = withDefaults(defineProps<{
  benchmark?: Benchmark;
}>(), {
  benchmark: undefined
});

const { selectedTimeRangeKey, startDate, endDate } = storeToRefs(useProjectStore())

const benchmarkConfig = computed(() => benchmarkConfigs.find((config) => config.key === props.benchmark?.key));
const benchmarkValue = computed(() => Math.ceil(props.benchmark?.value || 0));
const points = computed(() => benchmarkConfig.value?.points
  .find((point) => benchmarkValue.value >= point.pointStart
  && (point.pointEnd === null || benchmarkValue.value <= point.pointEnd)));
const type = computed(() => (points.value ? points.value.type : 'negative'));
const benchmarkText = computed(() => (points.value ? points.value.text : ''));

const isVisible = computed(() => (benchmarkConfig.value ? benchmarkConfig.value.visibilityCheck(
  selectedTimeRangeKey.value,
  startDate.value || '',
  endDate.value || '',
  props.benchmark?.additionalCheck
) : false));
</script>

<script lang="ts">
export default {
  name: 'LfxBenchmarksWrap'
};
</script>
