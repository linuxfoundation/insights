<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-collection-development-view />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxCollectionDevelopmentView from '~/components/modules/collection/views/collection-development.vue';

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
