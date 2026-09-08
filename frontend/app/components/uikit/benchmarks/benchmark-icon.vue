<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="c-benchmarks-icon"
    :class="[`c-benchmarks-icon--${props.type}`, { 'c-benchmarks-icon--circle': props.circle }]"
  >
    <lfx-icon
      v-if="props.type === 'positive'"
      name="thumbs-up"
      type="solid"
      :size="props.size"
    />
    <lfx-icon
      v-else-if="props.type === 'warning'"
      :name="props.useTriangle ? 'triangle-exclamation' : 'exclamation-circle'"
      type="solid"
      :size="props.size"
    />
    <lfx-icon
      v-else-if="props.type === 'negative'"
      name="thumbs-down"
      type="solid"
      :size="props.size"
    />
    <lfx-icon
      v-else-if="props.type === 'no-data'"
      name="minus"
      type="solid"
      :size="props.size"
    />
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = withDefaults(
  defineProps<{
    type: string;
    useTriangle?: boolean;
    size?: number;
    circle?: boolean;
  }>(),
  {
    useTriangle: false,
    size: 16,
    circle: false,
  },
);
</script>
<script lang="ts">
export default {
  name: 'LfxBenchmarkIcon',
};
</script>
