<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-explore />
</template>

<script setup lang="ts">
import LfxExplore from '~/components/modules/explore/views/explore.vue';

const title = 'LFX Insights';
const description =
  "Insights into the world's most critical open source software. By the Linux Foundation.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
