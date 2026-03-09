<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="!shadow-none !rounded-xl !border-neutral-200 flex flex-col p-4">
    <lfx-skeleton
      width="50%"
      height="2rem"
      class="max-w-full mb-10"
    />
    <lfx-skeleton
      width="70%"
      height="1.5rem"
      class="max-w-full"
    />
    <lfx-skeleton
      height="2.5rem"
      class="mt-1 max-w-full"
    />
    <lfx-skeleton
      width="35%"
      height="0.75rem"
      class="mt-6 max-w-full"
    />
    <lfx-skeleton
      width="45%"
      height="0.75rem"
      class="mt-2 max-w-full"
    />
    <lfx-skeleton
      height="2rem"
      class="mt-8 max-w-full"
    />
  </lfx-card>
</template>

<script setup lang="ts">
import LfxCard from '~/components/uikit/card/card.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionCardLoading',
};
</script>
