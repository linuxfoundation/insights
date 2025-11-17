<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <lfx-tooltip
    :content="tooltipFormatted"
    class="!w-full flex justify-end"
    placement="top-end"
  >
    <span v-if="data.value">{{ formattedDate }}</span>
    <span v-else>-</span>
  </lfx-tooltip>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { computed } from 'vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import { formatValueToLargestUnitDuration } from '~/components/shared/utils/formatter';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

const props = defineProps<{
  data: Leaderboard;
}>();

/**
 * Formats milliseconds to a duration string with up to 2 units
 * Example: 2y 3mo, 5d 3h, 1h 30m
 */
const formattedDate = computed(() => {
  if (!props.data.value || props.data.value === 0) {
    return '0s';
  }

  return formatValueToLargestUnitDuration(props.data.value, 2);
});

const tooltipFormatted = computed(() => {
  return DateTime.fromMillis(props.data.value).toFormat('MMM dd, yyyy');
});
</script>

<script lang="ts">
export default {
  name: 'TimestampDataDisplay',
};
</script>
