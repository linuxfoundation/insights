<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="c-benchmarks"
    :class="{
      'c-benchmarks--positive': props.type === 'positive',
      'c-benchmarks--warning': props.type === 'warning',
      'c-benchmarks--negative': props.type === 'negative',
    }"
  >
    <div class="c-benchmarks__header">
      <lfx-benchmark-icon :type="props.type" />
    </div>

    <div class="c-benchmarks__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BenchmarkType } from '~~/types/shared/benchmark.types';
import LfxBenchmarkIcon from '~/components/uikit/benchmarks/benchmark-icon.vue';

const props = defineProps<{
  type: BenchmarkType;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxBenchmarks',
};
</script>
