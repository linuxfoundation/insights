<template>
  <div
    class="c-benchmarks"
    :class="{
      'c-benchmarks--positive': props.type === 'positive',
      'c-benchmarks--warning': props.type === 'warning',
      'c-benchmarks--negative': props.type === 'negative' }"
  >
    <div class="c-benchmarks__header">
      <div class="c-benchmarks-icon">
        <lfx-icon
          v-if="props.type === 'positive'"
          name="thumbs-up"
          type="solid"
          :size="16"
        />
        <lfx-icon
          v-else-if="props.type === 'warning'"
          name="exclamation-circle"
          type="solid"
          :size="16"
        />
        <lfx-icon
          v-else-if="props.type === 'negative'"
          name="thumbs-down"
          type="solid"
          :size="16"
        />
      </div>
    </div>

    <div class="c-benchmarks__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BenchmarkType } from './types/benchmark.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  type: BenchmarkType;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxBenchmarks'
};
</script>
