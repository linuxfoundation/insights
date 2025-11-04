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

const props = withDefaults(
  defineProps<{
    value: number; // Time in milliseconds
  }>(),
  {
    value: 0,
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

  // Calculate duration from timestamp to now
  const timestamp = DateTime.fromMillis(props.value);
  const now = DateTime.now();
  const duration = now.diff(timestamp, ['years', 'months', 'days', 'hours', 'minutes', 'seconds']);
  const { years, months, days, hours, minutes, seconds } = duration.toObject();

  const units: Array<{ value: number; label: string }> = [];

  // Build array of non-zero units
  if (years && years > 0) {
    units.push({ value: Math.floor(years), label: 'y' });
  }
  if (months && months > 0) {
    units.push({ value: Math.floor(months), label: 'mo' });
  }

  if (days && days > 0) {
    units.push({ value: Math.floor(days), label: 'd' });
  }

  if (hours && hours > 0) {
    units.push({ value: Math.floor(hours), label: 'h' });
  }
  if (minutes && minutes > 0) {
    units.push({ value: Math.floor(minutes), label: 'm' });
  }
  if (seconds && seconds > 0) {
    units.push({ value: Math.floor(seconds), label: 's' });
  }

  // Return up to 2 units
  return units
    .slice(0, 2)
    .map((unit) => `${unit.value}${unit.label}`)
    .join(' ');
});

const dateFormatted = computed(() => {
  return DateTime.fromMillis(props.value).toFormat('MMM dd, yyyy');
});
</script>

<script lang="ts">
export default {
  name: 'TimeDurationDataDisplay',
};
</script>
