<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="data"
    class="flex flex-col gap-6"
  >
    <lfx-score-item
      v-for="item in data"
      :key="item.benchmarkKey"
      :benchmark-key="item.benchmarkKey"
      :value="item.value"
    />
  </div>
</template>

<script setup lang="ts">
import LfxScoreItem from './score-item.vue';
import type { ScoreData } from '~~/types/shared/benchmark.types';

defineProps<{
  data: ScoreData[] | undefined;
}>();

</script>
<script lang="ts">
export default {
  name: 'LfxProjectScoreList'
};
</script>
