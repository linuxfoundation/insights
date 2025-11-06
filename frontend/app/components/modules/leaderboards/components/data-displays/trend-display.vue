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
        class="text-xs font-medium"
        :class="getTrendColor"
      >
        {{ trendPercentage }}% ({{ formatTrendValue }})
      </span>
      <span
        v-else
        class="text-xs font-medium text-neutral-400"
      >
        = 0%
      </span>
    </div>
  </lfx-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LeaderboardDataType } from '../../config/types/leaderboard.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import { formatNumber, formatNumberShort, formatValueToLargestUnitDuration } from '~/components/shared/utils/formatter';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

const props = withDefaults(
  defineProps<{
    data: Leaderboard;
    isReverse?: boolean;
    dataType: LeaderboardDataType;
    decimals?: number;
  }>(),
  {
    isReverse: false,
    decimals: 0,
  },
);

const isTimeDisplay = computed(() => {
  return props.dataType === 'duration' || props.dataType === 'timestamp';
});

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
  if (isTimeDisplay.value) {
    return `${sign}${formatValueToLargestUnitDuration(Math.abs(trend.value), 2, props.dataType === 'duration')}`;
  }

  if (trend.value >= 1000000) {
    return formatNumberShort(trend.value);
  }

  return `${sign}${formatNumber(Math.abs(trend.value), props.decimals)}`;
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
