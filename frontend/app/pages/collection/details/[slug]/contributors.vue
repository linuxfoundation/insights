<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-collection-contributors-view />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxCollectionContributorsView from '~/components/modules/collection/views/collection-contributors.vue';

const title = computed(() => 'Collection Contributors Insights');
const description = computed(() => 'See who contributes across every project in this collection.');

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
