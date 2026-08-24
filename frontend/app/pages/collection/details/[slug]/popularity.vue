<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-collection-popularity-view />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxCollectionPopularityView from '~/components/modules/collection/views/collection-popularity.vue';

const title = computed(() => 'Collection Popularity Insights');
const description = computed(() => 'See stars and forks aggregated across every project in this collection.');

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
