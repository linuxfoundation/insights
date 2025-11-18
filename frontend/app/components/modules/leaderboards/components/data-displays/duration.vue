<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <span v-if="data.value">{{ formattedDuration }}</span>
  <span v-else>-</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatValueToLargestUnitDuration } from '~/components/shared/utils/formatter';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

const props = defineProps<{
  data: Leaderboard;
}>();

/**
 * Formats milliseconds to a duration string with up to 2 units
 * Example: 2y 3mo, 5d 3h, 1h 30m
 */
const formattedDuration = computed(() => {
  if (!props.data.value || props.data.value === 0) {
    return '0s';
  }

  return formatValueToLargestUnitDuration(props.data.value, 2, true);
});
</script>

<script lang="ts">
export default {
  name: 'DurationDataDisplay',
};
</script>
