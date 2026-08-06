<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="relative h-28 w-28 shrink-0">
    <div
      v-if="props.unavailable"
      class="h-28 w-28 rounded-full border-4 border-dashed border-neutral-300"
    />
    <lfx-chart
      v-else
      :config="gaugeConfig"
    />
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span class="text-4xl font-secondary font-light text-neutral-900 leading-none">{{
        props.unavailable ? '—' : props.score
      }}</span>
      <span
        v-if="!props.unavailable"
        class="text-xs text-neutral-500 mt-1"
        >out of 100</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getGaugeChartConfig } from '~/components/uikit/chart/configs/gauge.chart';
import { lfxColors } from '~/config/styles/colors';

const props = withDefaults(
  defineProps<{
    score: number;
    color?: string;
    unavailable?: boolean;
  }>(),
  {
    color: undefined,
    unavailable: false,
  },
);

const gaugeConfig = computed(() =>
  getGaugeChartConfig({
    value: props.score,
    maxValue: 100,
    gaugeType: 'full',
    name: '',
    graphOnly: true,
    lineColor: props.color || lfxColors.positive[500],
    lineWidth: 4,
  }),
);
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreRing',
};
</script>
