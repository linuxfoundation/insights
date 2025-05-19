<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <slot v-if="props.status === 'success'" />
  <lfx-skeleton
    v-else-if="props.status === 'pending'"
    :height="props.height"
    :width="props.width"
    :class="props.roundedClass"
  />
</template>

<script setup lang="ts">
import type { AsyncDataRequestStatus } from 'nuxt/app';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';

const props = withDefaults(defineProps<{
  status: AsyncDataRequestStatus;
  height: string;
  width: string;
  roundedClass?: string;
}>(), {
  roundedClass: 'rounded-sm'
});

</script>

<script lang="ts">
export default {
  name: 'LfxSkeletonState'
};
</script>
