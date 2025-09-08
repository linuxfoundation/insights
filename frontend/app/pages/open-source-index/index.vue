<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-open-source-index />
</template>

<script setup lang="ts">
import LfxOpenSourceIndex from '~/components/modules/open-source-index/views/open-source-index.vue';

const title = 'Open Source Index | LFX Insights';
const description = `Curated list of the most critical open source projects powering our modern
    digital infrastructure, measured by contributor volume and software value`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
