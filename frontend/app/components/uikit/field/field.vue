<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-1">
    <p class="text-sm font-medium leading-5">
      {{ props.label }}
      <span
        v-if="props.required"
        class="text-negative-500"
      >
        *
      </span>
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    required?: boolean;
  }>(),
  {
    required: false,
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxField',
};
</script>
