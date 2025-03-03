<template>
  <div
    class="flex flex-col"
    :class="{ 'flex-col-reverse': props.flipDisplay }"
  >
    <!-- TODO: These colors seems different from what is defined in the design system
     Waiting for verification from Nuno -->
    <span :class="['text-body-1 flex items-center gap-2', deltaColor]">
      <lfx-icon
        :name="props.icon"
        :type="props.iconType"
        :size="12"
      />
      {{ percentage }}%
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
  icon: '',
  iconType: 'light'
});

const percentage = computed(() => formatNumber(props.summary.percentageChange, 1));

const delta = computed(() => {
  const value = props.summary.changeValue;
  const sign = value >= 0 ? '+' : '';
  return sign + (props.isDuration ? formatNumberToDuration(value) : formatNumber(value, 1));
});

const deltaColor = computed(() => (props.isReverse ? 'text-negative-500' : 'text-positive-500'));

const deltaDisplay = computed(() => {
  if (!props.percentageOnly) {
    return `(${delta.value}${props.unit || ''})`;
  }
  return '';
});

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
