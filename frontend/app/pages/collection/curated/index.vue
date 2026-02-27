<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20">
    <lfx-collection-list-view type="curated" />
  </div>
</template>

<script setup lang="ts">
import LfxCollectionListView from '~/components/modules/collection/views/collection-list.vue';

const title = 'Curated Collections | LFX Insights';
const description =
  'Explore curated collections of open source projects on LFX Insights. ' +
  'Discover projects grouped by technology, ecosystem, and community.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  twitterDescription: description,
});
</script>
