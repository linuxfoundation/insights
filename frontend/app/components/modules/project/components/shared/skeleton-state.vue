<template>
  <slot v-if="props.status === 'success'" />
  <lfx-skeleton
    v-else-if="props.status === 'pending'"
    height="2rem"
    width="7.5rem"
    class="rounded-sm"
  />
</template>

<script setup lang="ts">
import type { AsyncDataRequestStatus } from 'nuxt/app';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';

const props = defineProps<{
  status: AsyncDataRequestStatus;
  height: string;
  width: string;
}>();

</script>

<script lang="ts">
export default {
  name: 'LfxSkeletonState'
};
</script>
