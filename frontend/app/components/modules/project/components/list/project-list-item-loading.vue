<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="p-5 md:p-6 flex flex-col">
    <lfx-skeleton
      width="3rem"
      height="3rem"
      class="rounded-md max-w-full"
    />
    <lfx-skeleton
      width="12.5rem"
      height="1.25rem"
      class="rounded-sm mt-5 max-w-full"
    />
    <div class="flex items-center justify-between mt-5">
      <lfx-skeleton
        width="7.5rem"
        height="0.75rem"
        class="rounded-sm max-w-full"
      />
      <lfx-skeleton
        width="5rem"
        height="0.75rem"
        class="rounded-sm max-w-full"
      />
    </div>
    <div class="flex items-center justify-between mt-5 pt-0.5">
      <lfx-skeleton
        width="7.5rem"
        height="0.75rem"
        class="rounded-sm max-w-full"
      />
      <lfx-skeleton
        width="5rem"
        height="0.75rem"
        class="rounded-sm max-w-full"
      />
    </div>
    <div class="flex items-center justify-between mt-5 pt-0.5">
      <lfx-skeleton
        width="7.5rem"
        height="0.75rem"
        class="rounded-sm max-w-full"
      />
      <lfx-skeleton
        width="5rem"
        height="0.75rem"
        class="rounded-sm max-w-full"
      />
    </div>
  </lfx-card>
</template>

<script lang="ts" setup>
import LfxCard from '~/components/uikit/card/card.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxProjectListItemLoading',
};
</script>
