<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container pt-16">
    <h1 class="text-4xl font-secondary font-light">Leaderboards</h1>
    <p class="text-neutral-500">Discover and compare open source projects across various performance metrics</p>
    <div class="grid lg:grid-cols-2 xl:grid-cols-3 grid-cols-1 gap-8 mt-8">
      <div
        v-for="config in leaderboardConfigs"
        :key="config.key"
        class="h-full flex"
      >
        <lfx-leaderboard-card
          v-if="!isPending"
          :config="config"
          :leaderboards="getLeaderboardsByType(config.key)"
        />
        <lfx-skeleton
          v-else
          class="!w-full !h-[440px] rounded-lg"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import leaderboardConfigs from '../../config/index.config';
import LfxLeaderboardCard from '../sections/leaderboard-card.vue';
import { LEADERBOARD_API_SERVICE } from '../../services/leaderboard.api.service';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';

const { data, isPending } = LEADERBOARD_API_SERVICE.fetchLeaderboardLanding();

const leaderboardsByType = computed(() => {
  return LEADERBOARD_API_SERVICE.groupLeaderboardsByType(data.value?.data || []);
});

const getLeaderboardsByType = (leaderboardType: string) => {
  const config = leaderboardConfigs.find((config) => config.key === leaderboardType);
  return leaderboardsByType.value[leaderboardType] || [];
};
</script>
<script lang="ts">
export default {
  name: 'LfxLeaderboardLanding',
};
</script>
