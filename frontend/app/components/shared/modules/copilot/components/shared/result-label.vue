<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <span class="flex items-center gap-2 w-full">
    <span class="rounded-full bg-neutral-200 px-1.5 py-0.5 text-xs font-semibold text-neutral-600">
      {{ `V${version}` }}
    </span>
    <span class="text-sm text-ellipsis overflow-hidden text-nowrap max-w-full min-w-0 text-neutral-900 font-semibold">
      {{ label }}
    </span>
  </span>
</template>
<script setup lang="ts">
defineProps<{
  version: number;
  label: string;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxChatResultLabel',
};
</script>
