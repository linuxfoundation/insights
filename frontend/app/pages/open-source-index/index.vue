<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-open-source-index />
</template>

<script setup lang="ts">
import LfxOpenSourceIndex from '~/components/modules/open-source-index/views/open-source-index.vue';

const title = 'Open Source Index | by Linux Foundation';
const description = 'Explore the Linux Foundation Open Source Index on LFX Insights. '
  + 'Compare thousands of open source projects by contributors, software value, and category.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
