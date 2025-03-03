<template>
  <!-- This component might change based on Nuno's feedback -->
  <div :class="`c-progress-bar c-progress-bar--${props.color}`">
    <div
      v-for="(value, index) in props.values"
      :key="index"
      class="c-progress-bar__value"
      :style="{ width: `${value}%` }"
    />
    <div
      v-if="props.label"
      class="c-progress-bar__label"
    >{{ props.label }}</div>
    <div
      v-if="!props.hideEmpty"
      class="c-progress-bar__empty"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProgressBarType } from './types/progress-bar.types';

const props = withDefaults(
  defineProps<{
    values: number[];
    // TODO: change this once we have the correct types
    color?: ProgressBarType;
    label?: string;
    hideEmpty?: boolean;
  }>(),
  {
    color: 'normal',
    hideEmpty: false,
    label: undefined
  }
);
</script>

<script lang="ts">
export default {
  name: 'LfxProgressBar'
};
</script>
