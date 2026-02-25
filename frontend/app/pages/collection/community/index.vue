<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white">
    <lfx-collection-list-view type="community" />
  </div>
</template>

<script setup lang="ts">
import LfxCollectionListView from '~/components/modules/collection/views/collection-list.vue';

const title = 'Community Collections | LFX Insights';
const description =
  'Explore community collections of open source projects on LFX Insights. ' +
  'Discover projects grouped by technology, ecosystem, and community.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  twitterDescription: description,
});
</script>
