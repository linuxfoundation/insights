<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-open-source-index />
</template>

<script setup lang="ts">
import LfxOpenSourceIndex from '~/components/modules/open-source-index/views/open-source-index.vue';

const title = 'Leaderboards | by Linux Foundation';
const description = 'Explore the Linux Foundation Leaderboards on LFX Insights.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
