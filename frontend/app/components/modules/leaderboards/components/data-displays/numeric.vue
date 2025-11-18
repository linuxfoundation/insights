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
import { formatNumber } from '~/components/shared/utils/formatter';
import { formatNumberShort } from '~/components/shared/utils/formatter';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

const props = withDefaults(
  defineProps<{
    data: Leaderboard;
    decimalPlaces?: number;
  }>(),
  {
    decimalPlaces: 0,
  },
);

const isLargeNumber = computed(() => {
  return props.data.value > 1000000;
});

/**
 * Formats a number to a numeric string with up to 2 units
 * Example: 1,000,000
 */
const formattedNumeric = computed(() => {
  if (!props.data.value || props.data.value === 0) {
    return '0';
  }

  if (isLargeNumber.value) {
    return formatNumberShort(props.data.value);
  }

  return formatNumber(props.data.value, props.decimalPlaces);
});
const formattedNumericTooltip = computed(() => {
  if (!props.data.value || props.data.value === 0) {
    return '0';
  }

  return formatNumber(props.data.value, props.decimalPlaces);
});
</script>

<script lang="ts">
export default {
  name: 'NumericDataDisplay',
};
</script>
