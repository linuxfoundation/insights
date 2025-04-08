<template>
  <div class="c-benchmarks-wrap max-lg:c-card">
    <div class="max-lg:w-full w-2/3">
      <slot />
    </div>
    <div class="c-benchmark-component">
      <lfx-benchmark :type="type">
        lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
        lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
        lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
        lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
        lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
      </lfx-benchmark>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type Benchmark, BenchmarkKeys } from './types/benchmark.types';
import LfxBenchmark from '~/components/uikit/benchmarks/benchmarks.vue';

const props = defineProps<{
  benchmark: Benchmark;
}>();

const type = computed(() => (props.benchmark.key === BenchmarkKeys.ContributorsLeaderboard ? 'positive' : 'negative'));
</script>

<script lang="ts">
export default {
  name: 'LfxBenchmarksWrap'
};
</script>
