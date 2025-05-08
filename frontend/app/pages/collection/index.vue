<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
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
  twitterDescription: description
})
</script>
