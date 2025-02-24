<template>
  <div class=" min-h-[8.125rem] sticky top-14 lg:top-17 z-10">
    <div class="bg-white outline outline-neutral-100">
      <lfx-collection-header :collection="props.collection" />
    </div>
  </div>
  <div class="h-screen"></div>
  <div class="h-screen"></div>
  <div class="h-screen"></div>
</template>

<script setup lang="ts">
import type {Collection} from "~/components/modules/collection/types/Collection";
import LfxCollectionHeader from "~/components/modules/collection/components/details/header.vue";

const props = defineProps<{
  collection: Collection
}>()
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionDetailsView'
};
</script>
