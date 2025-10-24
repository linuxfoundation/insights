<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex flex-col"
    :class="{ 'flex-col-reverse': props.flipDisplay }"
  >
    <!-- TODO: These colors seems different from what is defined in the design system
     Waiting for verification from Nuno -->
    <span
      class="text-body-1 flex items-center gap-2"
      :class="deltaColor"
    >
      <lfx-icon
        :name="deltaIcon"
        :type="'light'"
        :size="12"
      />
      <template v-if="!isHidePercentage"> {{ percentage }}% </template>
      {{ deltaDisplay }}
    </span>
    <span class="text-neutral-400 text-xs">
      vs.
      {{ previousDisplay }} last period</span
    >
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DeltaDisplayProps } from './types/delta-display.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { formatNumber, formatNumberShort, formatSecondsToDuration } from '~/components/shared/utils/formatter';

const props = withDefaults(defineProps<DeltaDisplayProps>(), {
  isReverse: false,
});

const isHidePercentage = computed(() => props.summary.percentageChange === undefined);
const percentage = computed(() => formatNumber(Math.abs(props.summary.percentageChange || 0), 1));

/**
 * This is used to determine the direction of the delta display
 * It is used to determine the color of the delta display
 * If props.isReverse is true, the delta direction is reversed
 */
const deltaDirection = computed<'positive' | 'negative'>(() => {
  const value = props.summary.changeValue;

  if (props.isReverse) {
    return value >= 0 ? 'negative' : 'positive';
  }

  return value >= 0 ? 'positive' : 'negative';
});

// TODO: remove isDuration and use deltaUnit instead
const delta = computed(() => {
  const value = props.summary.changeValue;
  const changeDuration = formatSecondsToDuration(Math.abs(value), 'short');
  const changeValue = props.isShort ? formatNumberShort(value) : formatNumber(value, 1);

  const sign = value >= 0 ? '+' : '';
  return sign + (props.isDuration ? changeDuration : changeValue);
});

const deltaColor = computed(() => (deltaDirection.value === 'negative' ? 'text-negative-600' : 'text-positive-600'));

const deltaDisplay = computed(() => {
  const unit = props.isDuration ? '' : props.unit;
  if (!props.percentageOnly) {
    return isHidePercentage.value ? `${delta.value}${unit || ''}` : `(${delta.value}${unit || ''})`;
  }
  return '';
});

// The up and down icons will only rely on the value instead of the deltaDirection
const deltaIcon = computed(() => (props.summary.changeValue < 0 ? 'circle-arrow-down' : 'circle-arrow-up'));

const previousDisplay = computed(() => {
  if (!props.hidePreviousValue) {
    const unit = props.isDuration ? '' : props.unit;
    const previousValue = props.isDuration
      ? formatSecondsToDuration(props.summary.previous || 0, 'short')
      : formatNumber(props.summary.previous, props.percentageOnly ? 1 : 0);
    return `${previousValue}${unit || ''}`;
  }
  return '';
});
</script>
