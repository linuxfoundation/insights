<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex gap-4 items-center">
    <div class="flex flex-row items-center py-4 border-b border-neutral-100 gap-3 w-1/2">
      <lfx-skeleton
        width="2rem"
        height="2rem"
        class="rounded-sm"
      />
      <div class="flex flex-col gap-2 flex-1">
        <lfx-skeleton
          width="50%"
          height="1rem"
          class="rounded-sm"
        />
        <lfx-skeleton
          width="100%"
          height="1rem"
          class="rounded-sm"
        />
      </div>
    </div>
    <div class="w-1/2 flex gap-8 items-center justify-end">
      <lfx-skeleton
        width="75%"
        height="1rem"
        class="rounded-sm"
      />
      <lfx-skeleton
        width="1rem"
        height="1rem"
        class="rounded-sm"
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
