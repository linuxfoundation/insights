<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="relative shrink-0"
    :class="props.large ? 'h-32 w-32' : 'h-28 w-28'"
  >
    <div
      v-if="props.unavailable"
      class="h-full w-full rounded-full border-4 border-dashed border-neutral-300"
    />
    <lfx-chart
      v-else
      :config="gaugeConfig"
    />
    <svg
      v-if="!props.unavailable && isPartial"
      class="absolute inset-0 h-28 w-28 pointer-events-none"
      viewBox="0 0 112 112"
      aria-hidden="true"
    >
      <path
        :d="missingArcPath"
        fill="none"
        :stroke="lfxColors.neutral[200]"
        stroke-width="4"
        stroke-linecap="round"
        stroke-dasharray="0 8"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span
        class="text-4xl font-secondary text-neutral-900 leading-none"
        :class="props.large ? 'font-bold' : 'font-light'"
        >{{ props.unavailable ? '—' : props.score }}</span
      >
      <span
        v-if="!props.unavailable"
        class="text-xs text-neutral-500 mt-1"
        >out of {{ props.maxScore }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GaugeSeriesOption } from 'echarts';
import { computed } from 'vue';

import LfxChart from '~/components/uikit/chart/chart.vue';
import { getGaugeChartConfig } from '~/components/uikit/chart/configs/gauge.chart';
import { lfxColors } from '~/config/styles/colors';
import { isPartialHealthScore } from '~~/config/trust-score';

const props = withDefaults(
  defineProps<{
    score: number;
    color?: string;
    unavailable?: boolean;
    maxScore?: number;
    large?: boolean;
  }>(),
  {
    color: undefined,
    unavailable: false,
    maxScore: 100,
    large: false,
  },
);

const isPartial = computed(() => isPartialHealthScore(props.maxScore));

// Arc is always on a 0-100 scale; for partial scores the track past maxScore is left for the dotted overlay.
const gaugeConfig = computed(() => {
  const config = getGaugeChartConfig({
    value: props.score,
    gaugeType: 'full',
    name: '',
    graphOnly: true,
    lineColor: props.color || lfxColors.positive[500],
    lineWidth: props.large ? 12 : 4,
  });
  if (!isPartial.value) return config;
  const [series] = config.series as GaugeSeriesOption[];
  series.axisLine = {
    ...series.axisLine,
    lineStyle: {
      ...series.axisLine?.lineStyle,
      color: [
        [props.maxScore / 100, lfxColors.neutral[200]],
        [1, 'transparent'],
      ],
    },
  };
  return config;
});

// Arc from maxScore to 100, inset 6px at each end so dots clear the score arc's round caps.
const missingArcPath = computed(() => {
  const r = 54;
  const inset = 6 / (2 * Math.PI * r);
  const point = (fraction: number) => {
    const angle = fraction * 2 * Math.PI;
    return `${56 + r * Math.sin(angle)} ${56 - r * Math.cos(angle)}`;
  };
  const start = props.maxScore / 100 + inset;
  const end = 1 - inset;
  const largeArc = end - start > 0.5 ? 1 : 0;
  return `M ${point(start)} A ${r} ${r} 0 ${largeArc} 1 ${point(end)}`;
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthScoreRing',
};
</script>
