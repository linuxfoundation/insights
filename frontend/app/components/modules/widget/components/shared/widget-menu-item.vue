<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="h-9 w-9 rounded-full hover:bg-neutral-100 flex items-center justify-center cursor-pointer transition-all"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup></script>

<script lang="ts">
export default {
  name: 'LfxWidgetMenuItem',
};
</script>
