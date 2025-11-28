<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <lfx-tooltip content="vs. previous 12M period">
    <div class="flex gap-1 items-center">
      <lfx-icon
        :name="getTrendIcon"
        type="solid"
        :size="12"
        :class="getTrendColor"
      />
      <span
        v-if="trendDirection !== 'neutral'"
        class="text-xs font-medium text-nowrap"
        :class="getTrendColor"
      >
        {{ trendPercentage }}%
        <span class="hidden sm:inline"> ({{ formatTrendValue }}) </span>
      </span>
      <span
        v-else
        class="text-xs font-medium text-neutral-400"
      >
        0%
      </span>
    </div>
  </lfx-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { formatValueToLargestUnitDuration } from '~/components/shared/utils/formatter';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

const props = defineProps<{
  data: Leaderboard;
  isDuration?: boolean;
}>();

const trend = computed(() => {
  return props.data.value - props.data.previousPeriodValue;
});

const trendPercentage = computed(() => {
  if (!props.data.previousPeriodValue) {
    // For division by zero, show as 100% increase
    return '100.0';
  }
  const value = (Math.abs(trend.value) / props.data.previousPeriodValue) * 100;
  return value.toFixed(1);
});

const formatTrendValue = computed(() => {
  const sign = trend.value >= 0 ? '+' : '-';

  return `${sign}${formatValueToLargestUnitDuration(Math.abs(trend.value), 2, props.isDuration)}`;
});

const trendDirection = computed(() => {
  if (trend.value === 0) return 'neutral';

  return trend.value > 0 ? 'up' : 'down';
});

const getTrendIcon = computed(() => {
  if (trendDirection.value === 'neutral') return 'equals';

  return trendDirection.value === 'up' ? 'circle-arrow-up' : 'circle-arrow-down';
});

const getTrendColor = computed(() => {
  if (trendDirection.value === 'neutral') return 'text-neutral-400';

  return trendDirection.value === 'up' ? 'text-positive-600' : 'text-negative-600';
});
</script>

<script lang="ts">
export default {
  name: 'TimestampDurationTrend',
};
</script>
