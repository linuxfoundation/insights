<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <slot v-if="!isLoading" />
  <div
    v-else
    class="flex flex-col gap-3"
  >
    <lfx-skeleton
      height="1rem"
      width="7.5rem"
      class="rounded-sm"
    />
    <lfx-skeleton
      height="1rem"
      width="100%"
      class="rounded-sm"
    />
    <lfx-skeleton
      height="1rem"
      width="16.875rem"
      class="rounded-sm"
    />
  </div>
</template>

<script setup lang="ts">
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';

defineProps<{
  isLoading: boolean;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSectionLoading',
};
</script>
