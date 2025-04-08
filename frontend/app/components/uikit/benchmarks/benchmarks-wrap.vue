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
import type { Benchmark } from '~~/types/shared/benchmark.types';
import LfxBenchmark from '~/components/uikit/benchmarks/benchmarks.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import { benchmarkConfigs } from '~~/app/config/benchmarks';

const props = defineProps<{
  benchmark: Benchmark;
}>();

const { selectedTimeRangeKey, startDate, endDate } = useProjectStore();

const benchmarkConfig = computed(() => benchmarkConfigs.find((config) => config.key === props.benchmark.key));
const points = computed(() => benchmarkConfig.value?.points
  .find((point) => props.benchmark.value >= point.pointStart
  && (point.pointEnd === null || props.benchmark.value <= point.pointEnd)));
const type = computed(() => (points.value ? points.value.type : 'negative'));
const benchmarkText = computed(() => (points.value ? points.value.text : ''));

const isVisible = computed(() => (benchmarkConfig.value ? benchmarkConfig.value.visibilityCheck(
  selectedTimeRangeKey,
  startDate || '',
  endDate || ''
) : false));
</script>

<script lang="ts">
export default {
  name: 'LfxBenchmarksWrap'
};
</script>
