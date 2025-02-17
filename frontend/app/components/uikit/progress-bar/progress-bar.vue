<template>
  <!-- This component might change based on Nuno's feedback -->
  <div :class="`c-progress-bar c-progress-bar--${props.color}`">
    <div class="c-progress-bar__value" :style="{ width: `${props.value}%` }" />
    <div class="c-progress-bar__empty" />
  </div>
</template>

<script setup lang="ts">
import type { ProgressBarType } from './types/progress-bar.types';

const props = withDefaults(
  defineProps<{
    value: number;
    // TODO: change this once we have the correct types
    color?: ProgressBarType;
  }>(),
  {
    color: 'normal'
  }
);
</script>

<script lang="ts">
export default {
  name: 'LfxProgressBar'
};
</script>
