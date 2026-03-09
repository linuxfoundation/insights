<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center gap-2 py-4 px-2 -mx-2">
    <div class="flex items-center gap-3 w-2/5">
      <lfx-skeleton
        width="2.5rem"
        height="2.5rem"
        class="rounded-md"
      />
      <lfx-skeleton
        width="12rem"
        height="1rem"
        class="rounded-md"
      />
    </div>
    <div class="w-1/5">
      <lfx-skeleton
        width="50%"
        height="1rem"
        class="rounded-md"
      />
    </div>
    <div class="w-1/5">
      <lfx-skeleton
        width="50%"
        height="1rem"
        class="rounded-md"
      />
    </div>
    <div class="w-1/5">
      <lfx-skeleton
        width="50%"
        height="1rem"
        class="rounded-md"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionProjectItemLoading',
};
</script>
