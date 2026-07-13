<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-collection-popularity-view :slug="slug as string" />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed } from 'vue';
import LfxCollectionPopularityView from '~/components/modules/collection/views/collection-popularity.vue';

const route = useRoute();
const { slug } = route.params;

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
