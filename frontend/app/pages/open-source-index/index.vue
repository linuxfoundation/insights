<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-open-source-index :is-root="true" />
</template>

<script setup lang="ts">
import LfxOpenSourceIndex from '~/components/modules/open-source-index/views/open-source-index.vue';
import { pageTitlesDescriptions } from '~/config/pageTitles';

const title = pageTitlesDescriptions.openSourceIndex.title;
const description = pageTitlesDescriptions.openSourceIndex.description;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  twitterDescription: description
})
</script>
