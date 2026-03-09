<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-row items-center py-4 px-2 border-b border-neutral-100">
    <div class="flex flex-col gap-1 w-1/2">
      <lfx-skeleton
        width="25rem"
        height="1.25rem"
        class="max-w-full"
      />
      <lfx-skeleton
        width="25rem"
        height="0.75rem"
        class="max-w-full"
      />
    </div>
    <div class="w-1/2 pl-10">
      <lfx-skeleton
        width="15rem"
        height="1.25rem"
        class="max-w-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListItemLoading',
};
</script>
