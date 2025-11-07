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
import leaderboardConfigs from '~/components/modules/leaderboards/config/index.config';

const route = useRoute();
const leaderboardKey = computed(() => route.params.key as string);

const leaderboardConfig = computed(() => leaderboardConfigs.find((config) => config.key === leaderboardKey.value));

const title = `${leaderboardConfig.value?.seoTitle} | Open Source Leaderboards | LFX Insights`;
const description = leaderboardConfig.value?.seoDescription;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
