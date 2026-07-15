<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-collection-development-view :slug="slug as string" />
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed } from 'vue';
import LfxCollectionDevelopmentView from '~/components/modules/collection/views/collection-development.vue';

const route = useRoute();
const { slug } = route.params;

const title = computed(() => 'Collection Development Insights');
const description = computed(
  () => 'See active contributors and organizations aggregated across every project in this collection.',
);

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
