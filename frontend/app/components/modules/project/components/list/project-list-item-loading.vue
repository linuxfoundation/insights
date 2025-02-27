<template>
  <lfx-card class="p-6 flex flex-col">
    <lfx-skeleton width="3rem" height="3rem" class="rounded-md" />
    <lfx-skeleton width="12.5rem" height="1.25rem" class="rounded-sm mt-5" />
    <div class="flex items-center justify-between mt-5">
      <lfx-skeleton width="7.5rem" height="0.75rem" class="rounded-sm" />
      <lfx-skeleton width="5rem" height="0.75rem" class="rounded-sm" />
    </div>
    <div class="flex items-center justify-between mt-5 pt-0.5">
      <lfx-skeleton width="7.5rem" height="0.75rem" class="rounded-sm" />
      <lfx-skeleton width="5rem" height="0.75rem" class="rounded-sm" />
    </div>
    <div class="flex items-center justify-between mt-5 pt-0.5">
      <lfx-skeleton width="7.5rem" height="0.75rem" class="rounded-sm" />
      <lfx-skeleton width="5rem" height="0.75rem" class="rounded-sm" />
    </div>
  </lfx-card>
</template>

<script lang="ts" setup>
import LfxCard from "~/components/uikit/card/card.vue";
import LfxSkeleton from "~/components/uikit/skeleton/skeleton.vue";
</script>

<script lang="ts">
export default {
  name: 'LfxProjectListItemLoading'
}
</script>
