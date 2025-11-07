<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <lfx-tooltip
    v-if="isLargeNumber"
    :content="formattedNumericTooltip"
    placement="top-end"
    class="!w-full"
  >
    <span class="cursor-pointer">{{ formattedNumeric }}</span>
  </lfx-tooltip>
  <span
    v-else
    class="leading-5"
    >{{ formattedNumeric }}</span
  >
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LeaderboardDataType } from '../../config/types/leaderboard.types';
import { formatNumber } from '~/components/shared/utils/formatter';
import { formatNumberShort } from '~/components/shared/utils/formatter';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

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

const isLargeNumber = computed(() => {
  return props.value > 1000000;
});

/**
 * Formats a number to a numeric string with up to 2 units
 * Example: 1,000,000
 */
const formattedNumeric = computed(() => {
  if (!props.value || props.value === 0) {
    return '0';
  }

  if (isLargeNumber.value) {
    return formatNumberShort(props.value);
  }

  return formatNumber(props.value, props.decimals);
});
const formattedNumericTooltip = computed(() => {
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
