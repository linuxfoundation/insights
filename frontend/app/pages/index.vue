<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-explore />
</template>

<script setup lang="ts">
import LfxExplore from '~/components/modules/explore/views/explore.vue';

const title = 'LFX Insights – Open Source Project Health & Trust Analytics';
const description =
  'Evaluate the health and trustworthiness of 13,000+ open source projects with contributor, ' +
  'security, and activity metrics. Free, by the Linux Foundation.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
