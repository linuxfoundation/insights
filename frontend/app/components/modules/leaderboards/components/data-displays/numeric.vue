<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <span>{{ formattedNumeric }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LeaderboardDataType } from '../../config/types/leaderboard.types';
import { formatNumber } from '~/components/shared/utils/formatter';

const props = withDefaults(
  defineProps<{
    value: number;
    dataType: LeaderboardDataType;
    decimals?: number;
  }>(),
  {
    value: 0,
    decimals: 0,
  },
);

/**
 * Formats a number to a numeric string with up to 2 units
 * Example: 1,000,000
 */
const formattedNumeric = computed(() => {
  if (!props.value || props.value === 0) {
    return '0';
  }

  return formatNumber(props.value, props.decimals);
});
</script>

<script lang="ts">
export default {
  name: 'NumericDataDisplay',
};
</script>
