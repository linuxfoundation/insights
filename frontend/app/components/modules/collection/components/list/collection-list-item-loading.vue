<template>
  <lfx-card class="p-5 md:p-6 hover:shadow-sm transition-all">
    <lfx-skeleton
      width="25rem"
      height="1.25rem"
    />
    <lfx-skeleton
      width="37.25rem"
      height="0.75rem"
      class="mt-5"
    />
    <lfx-skeleton
      width="31.25rem"
      height="0.75rem"
      class="mt-5"
    />
  </lfx-card>
</template>

<script setup lang="ts">
import LfxCard from "~/components/uikit/card/card.vue";
import LfxSkeleton from "~/components/uikit/skeleton/skeleton.vue";
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionListItemLoading'
}
</script>
