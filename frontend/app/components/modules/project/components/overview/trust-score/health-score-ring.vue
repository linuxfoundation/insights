<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="relative h-28 w-28 shrink-0">
    <lfx-chart :config="gaugeConfig" />
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span class="text-4xl font-secondary font-light text-neutral-900 leading-none">{{ props.score }}</span>
      <span class="text-xs text-neutral-500 mt-1">out of 100</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getGaugeChartConfig } from '~/components/uikit/chart/configs/gauge.chart';
import { lfxColors } from '~/config/styles/colors';

const props = defineProps<{
  score: number;
  color?: string;
}>();

const gaugeConfig = computed(() =>
  getGaugeChartConfig({
    value: props.score,
    maxValue: 100,
    gaugeType: 'full',
    name: '',
    graphOnly: true,
    lineColor: props.color || lfxColors.positive[500],
  }),
);
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreRing',
};
</script>
