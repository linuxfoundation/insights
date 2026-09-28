<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- This component might change based on Nuno's feedback -->
  <div :class="`c-progress-bar c-progress-bar--${props.color} c-progress-bar--size-${props.size}`">
    <div
      v-for="(value, index) in props.values"
      :key="`${value}-${index}`"
      class="c-progress-bar__value"
      :style="{ width: `${value}%` }"
    />
    <div
      v-if="props.label"
      class="c-progress-bar__label"
    >
      {{ props.label }}
    </div>
    <div
      v-if="!props.hideEmpty"
      class="c-progress-bar__empty"
    />
    <div
      v-if="props.missing"
      class="c-progress-bar__missing"
      :style="{ width: `${props.missing}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProgressBarType } from './types/progress-bar.types';

const props = withDefaults(
  defineProps<{
    values: number[];
    size?: 'small' | 'normal';
    // TODO: change this once we have the correct types
    color?: ProgressBarType;
    label?: string;
    hideEmpty?: boolean;
    // trailing dotted segment (percent) for data that is missing rather than scored low
    missing?: number;
  }>(),
  {
    color: 'normal',
    size: 'normal',
    hideEmpty: false,
    label: undefined,
    missing: undefined,
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxProgressBar',
};
</script>
