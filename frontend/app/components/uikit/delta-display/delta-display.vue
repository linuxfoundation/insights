<template>
  <div
    class="flex flex-col"
    :class="{ 'flex-col-reverse': props.flipDisplay }"
  >
    <!-- TODO: These colors seems different from what is defined in the design system
     Waiting for verification from Nuno -->
    <span :class="['text-body-1 flex items-center gap-2', deltaColor]">
      <lfx-icon
        :name="deltaIcon"
        :type="props.iconType"
        :size="12"
      />
      <template v-if="!isHidePercentage">
        {{ percentage }}%
      </template>
      {{ deltaDisplay }}
    </span>
    <span class="text-neutral-400 text-xs">
      vs.
      {{ previousDisplay }} last period</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DeltaDisplayProps } from './types/delta-display.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { formatNumber, formatNumberToDuration } from '~/components/shared/utils/formatter';

const props = withDefaults(defineProps<DeltaDisplayProps>(), {
  isReverse: false,
  icon: '', // ignoring this property for now, it seems there are only 2 types
  iconType: 'light'
});

const isHidePercentage = computed(() => props.summary.percentageChange === undefined);
const percentage = computed(() => formatNumber(Math.abs(props.summary.percentageChange || 0), 1));

/**
 * This is used to determine the direction of the delta display
 * It is used to determine the color of the delta display
 * It is used to determine the icon of the delta display
 * If props.isReverse is true, the delta direction is reversed
 */
const deltaDirection = computed<'positive' | 'negative'>(() => {
  const value = props.summary.changeValue;

  if (props.isReverse) {
    return value >= 0 ? 'negative' : 'positive';
  }

  return value >= 0 ? 'positive' : 'negative';
});

const delta = computed(() => {
  const value = props.summary.changeValue;
  const sign = value >= 0 ? '+' : '';
  return sign + (props.isDuration ? formatNumberToDuration(value) : formatNumber(value, 1));
});

const deltaColor = computed(() => (deltaDirection.value === 'negative'
  ? 'text-negative-500' : 'text-positive-500'));

const deltaDisplay = computed(() => {
  if (!props.percentageOnly) {
    return isHidePercentage.value ? `${delta.value}${props.unit || ''}` : `(${delta.value}${props.unit || ''})`;
  }
  return '';
});

const deltaIcon = computed(() => (deltaDirection.value === 'negative'
  ? 'circle-arrow-down' : 'circle-arrow-up'));

const previousDisplay = computed(() => {
  if (!props.hidePreviousValue) {
    const previousValue = props.isDuration
      ? formatNumberToDuration(props.summary.previous)
      : formatNumber(props.summary.previous, props.percentageOnly ? 1 : 0);
    return `${previousValue}${props.unit || ''}`;
  }
  return '';
});
</script>
