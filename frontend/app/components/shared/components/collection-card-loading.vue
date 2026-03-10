<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="!shadow-none !rounded-xl !border-neutral-200 flex flex-col">
    <lfx-skeleton
      v-if="variant === 'curated'"
      width="100%"
      height="7.5rem"
      class="max-w-full rounded-t-xl"
    />
    <div
      v-else
      class="flex items-center p-4"
    >
      <lfx-skeleton
        width="2rem"
        height="2rem"
        class="rounded-full border border-neutral-200"
      />
      <lfx-skeleton
        width="2rem"
        height="2rem"
        class="rounded-full -ms-2 border border-neutral-200"
      />
      <lfx-skeleton
        width="2rem"
        height="2rem"
        class="rounded-full -ms-2 border border-neutral-200"
      />
      <lfx-skeleton
        width="2rem"
        height="2rem"
        class="rounded-full -ms-2 border border-neutral-200"
      />
      <lfx-skeleton
        width="2rem"
        height="2rem"
        class="rounded-full -ms-2 border border-neutral-200"
      />
    </div>
    <div class="p-4 flex flex-col gap-3">
      <lfx-skeleton
        width="50%"
        height="1.5rem"
        class="max-w-full rounded-sm"
      />
      <lfx-skeleton
        width="100%"
        height="1rem"
        class="max-w-full rounded-sm"
      />
      <lfx-skeleton
        width="75%"
        height="1rem"
        class="max-w-full rounded-sm"
      />
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import LfxCard from '~/components/uikit/card/card.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import type { CollectionType } from '~~/types/collection';

withDefaults(
  defineProps<{
    variant?: CollectionType;
  }>(),
  {
    variant: 'curated',
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionCardLoading',
};
</script>
