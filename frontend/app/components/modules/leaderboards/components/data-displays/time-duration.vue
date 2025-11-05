<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <lfx-tooltip
    :content="dateFormatted"
    class="!w-full flex justify-end"
    placement="top-end"
  >
    <span v-if="value">{{ formattedDuration }}</span>
    <span v-else>-</span>
  </lfx-tooltip>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { computed } from 'vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import { formatValueToLargestUnitDuration } from '~/components/shared/utils/formatter';

const props = withDefaults(
  defineProps<{
    value: number; // Time in milliseconds or duration in seconds
    isDataDuration?: boolean;
  }>(),
  {
    value: 0,
    isDataDuration: false,
  },
);

/**
 * Formats milliseconds to a duration string with up to 2 units
 * Example: 2y 3mo, 5d 3h, 1h 30m
 */
const formattedDuration = computed(() => {
  if (!props.value || props.value === 0) {
    return '0s';
  }

  return formatValueToLargestUnitDuration(props.value, 2, props.isDataDuration);
});

const dateFormatted = computed(() => {
  if (props.isDataDuration) {
    // If it's a duration, show the duration in a human-readable format
    return formattedDuration.value;
  }
  return DateTime.fromMillis(props.value).toFormat('MMM dd, yyyy');
});
</script>

<script lang="ts">
export default {
  name: 'TimeDurationDataDisplay',
};
</script>
