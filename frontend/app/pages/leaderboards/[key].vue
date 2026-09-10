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
const leaderboardKey = computed<string>(() => route.params.key as string);
const config = computed(() => leaderboardConfigs.find((c) => c.key === leaderboardKey.value));
const title = computed(() => config.value?.name || 'Leaderboard');

const seoTitle = computed(() =>
  config.value?.name
    ? `${config.value.name} Leaderboard – Top Open Source Projects | LFX Insights`
    : 'Leaderboard | LFX Insights',
);
const seoDescription = computed(
  () =>
    config.value?.description ||
    'Explore leaderboards for the world’s most critical open source projects. Powered by the Linux Foundation.',
);

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
});

defineOgImage('Leaderboard', {
  leaderboardTitle: title,
});
</script>
