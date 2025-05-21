<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="parsedData"
    class="flex flex-col gap-4"
  >
    <div
      v-for="item in parsedData"
      :key="item.benchmarkKey"
      class="[&:not(:last-child)]:border-b border-neutral-100 [&:not(:last-child)]:pb-4"
    >
      <lfx-score-item
        :benchmark-key="item.benchmarkKey"
        :value="item.value"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxScoreItem from './score-item.vue';
import { BenchmarkKeys, type ScoreData } from '~~/types/shared/benchmark.types';

const props = defineProps<{
  data: ScoreData[] | undefined;
}>();

// NOTE: TEMPORARY
const parsedData = computed(() => props.data?.filter(
  (item) => item.benchmarkKey !== BenchmarkKeys.GeographicalDistribution
));

</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreList'
};
</script>
