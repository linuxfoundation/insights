<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-explore />
</template>

<script setup lang="ts">
import LfxExplore from '~/components/modules/explore/views/explore.vue';
import { pageTitlesDescriptions } from '~/config/pageTitles';

const title = pageTitlesDescriptions.explore.title;
const description = pageTitlesDescriptions.explore.description;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  twitterDescription: description
})
</script>
