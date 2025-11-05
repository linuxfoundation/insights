<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex gap-1 items-center">
    <lfx-icon
      :name="getTrendIcon"
      type="solid"
      :size="12"
      :class="getTrendColor"
    />
    <span
      class="text-xs leading-[15px] font-medium"
      :class="getTrendColor"
    >
      {{ trendPercentage }}% ({{ formatTrendValue }})
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import { formatNumber, formatNumberShort, formatValueToLargestUnitDuration } from '~/components/shared/utils/formatter';

const props = withDefaults(
  defineProps<{
    data: Leaderboard;
    isReverse?: boolean;
    isTimeDisplay?: boolean;
    isDataDuration?: boolean;
  }>(),
  {
    isReverse: false,
    isTimeDisplay: false,
    isDataDuration: false,
  },
);

const trend = computed(() => {
  return props.data.value - props.data.previousPeriodValue;
});

const trendPercentage = computed(() => {
  if (!props.data.previousPeriodValue) {
    // For division by zero, show as 100% increase
    return '100.0';
  }
  const value = (trend.value / props.data.previousPeriodValue) * 100;
  return value.toFixed(1);
});

const formatTrendValue = computed(() => {
  const sign = trend.value >= 0 ? '+' : '-';
  if (props.isTimeDisplay) {
    return `${sign}${formatValueToLargestUnitDuration(Math.abs(trend.value), 2, props.isDataDuration)}`;
  }

  if (trend.value >= 1000000) {
    return formatNumberShort(trend.value);
  }

  return `${sign}${formatNumber(Math.abs(trend.value))}`;
});

const trendDirection = computed(() => {
  if (trend.value === 0) return 'neutral';

  return trend.value > 0 ? 'up' : 'down';
});

const getTrendIcon = computed(() => {
  if (trendDirection.value === 'neutral') return 'equals';

  const isUp = trendDirection.value === 'up';
  const shouldShowUp = props.isReverse ? !isUp : isUp;

  return shouldShowUp ? 'circle-arrow-up' : 'circle-arrow-down';
});

const getTrendColor = computed(() => {
  if (trendDirection.value === 'neutral') return 'text-brand-500';

  const isUp = trendDirection.value === 'up';
  const shouldBePositive = props.isReverse ? !isUp : isUp;

  return shouldBePositive ? 'text-positive-600' : 'text-negative-600';
});
</script>

<script lang="ts">
export default {
  name: 'LeaderboardTrendDisplay',
};
</script>
