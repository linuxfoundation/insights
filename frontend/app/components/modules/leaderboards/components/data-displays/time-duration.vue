<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <span>{{ formattedDuration }}</span>
</template>

<script setup lang="ts">
import { Duration } from 'luxon';
import { computed } from 'vue';

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

  // Convert milliseconds to duration
  const duration = Duration.fromMillis(props.value).rescale();
  const { years, months, weeks, days, hours, minutes, seconds } = duration.toObject();

  const units: Array<{ value: number; label: string }> = [];

  // Build array of non-zero units
  if (years && years > 0) {
    units.push({ value: Math.floor(years), label: 'y' });
  }
  if (months && months > 0) {
    units.push({ value: Math.floor(months), label: 'mo' });
  }

  // Combine weeks and days
  const totalDays = (weeks || 0) * 7 + (days || 0);
  if (totalDays > 0) {
    units.push({ value: Math.floor(totalDays), label: 'd' });
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
</script>

<script lang="ts">
export default {
  name: 'TimeDurationDataDisplay',
};
</script>
