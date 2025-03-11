<template>
  <lfx-collection-list-view />
</template>

<script setup lang="ts">
import LfxCollectionListView from "~/components/modules/collection/views/collection-list.vue";

const title = 'Collections | LFX Insights';
const description = 'Explore a curated list of collections to gain valuable insights'
    + ' and stay informed with the latest trends and data on LFX Insights.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
