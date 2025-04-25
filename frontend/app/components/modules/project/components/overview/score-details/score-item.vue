<template>
  <div class="flex flex-row gap-2.5">
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
import type { BenchmarkKeys } from '~~/types/shared/benchmark.types';
import { benchmarkConfigs } from '~~/app/config/benchmarks';
import LfxBenchmarkIcon from '~/components/uikit/benchmarks/benchmark-icon.vue';

const props = defineProps<{
  benchmarkKey: BenchmarkKeys;
  value: number;
}>();

const benchmarkConfig = computed(() => benchmarkConfigs.find((config) => config.key === props.benchmarkKey));
const title = computed(() => benchmarkConfig.value?.title);
const pointDetails = computed(() => benchmarkConfig.value?.points
  .find((point) => (props.value || 0) >= point.pointStart
  && (point.pointEnd === null || (props.value || 0) <= point.pointEnd)));
const description = computed(() => `${pointDetails.value?.description} - ${pointDetails.value?.text}`);
const iconBGColor = computed(() => `bg-${pointDetails.value?.type}-100`);

</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreItem'
};
</script>
