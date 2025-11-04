<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20">
    <lfx-leaderboard-landing />
  </div>
</template>

<script setup lang="ts">
import LfxLeaderboardLanding from '~/components/modules/leaderboards/components/views/leaderboard-landing.vue';

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
