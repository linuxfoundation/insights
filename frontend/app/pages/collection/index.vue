<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-collection-list-view />
</template>

<script setup lang="ts">
import { pageTitlesDescriptions } from '~/config/pageTitles';
import LfxCollectionListView from "~/components/modules/collection/views/collection-list.vue";

const title = pageTitlesDescriptions.collections.title;
const description = pageTitlesDescriptions.collections.description;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  twitterDescription: description
})
</script>
