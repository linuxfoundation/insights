<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20">
    <lfx-leaderboard-detail :leaderboard-key="leaderboardKey" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed } from 'vue';
import LfxLeaderboardDetail from '~/components/modules/leaderboards/components/views/leaderboard-detail.vue';

const route = useRoute();
const leaderboardKey = computed(() => route.params.key as string);

const title = `${leaderboardKey.value} | Leaderboards | by Linux Foundation`;
const description = `Explore the ${leaderboardKey.value} leaderboard on LFX Insights.`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
