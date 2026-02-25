<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white">
    <lfx-collection-list-view type="my-collections" />
  </div>
</template>

<script setup lang="ts">
import LfxCollectionListView from '~/components/modules/collection/views/collection-list.vue';

const title = 'My Collections | LFX Insights';
const description = 'View and manage your personal collections of open source projects on LFX Insights.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  twitterDescription: description,
});
</script>
