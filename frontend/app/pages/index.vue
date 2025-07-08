<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-explore />
</template>

<script setup lang="ts">
import LfxExplore from '~/components/modules/explore/views/explore.vue';

const title = 'Explore | LFX Insights';
const description = `Discover the world'smost critical open source projects.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  twitterDescription: description
})
</script>
