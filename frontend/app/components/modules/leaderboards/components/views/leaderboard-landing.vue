<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container">
    <h1 class="text-4xl font-secondary font-light">Leaderboards</h1>
    <p class="text-neutral-500">Discover and compare open source projects across various performance metrics</p>
    <div class="grid grid-cols-3 gap-8">
      <div
        v-for="config in leaderboardConfigs"
        :key="config.key"
      >
        <lfx-leaderboard-card :config="config" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import leaderboardConfigs from '../../config/index.config';
import LfxLeaderboardCard from '../sections/leaderboard-card.vue';
</script>
<script lang="ts">
export default {
  name: 'LfxLeaderboardLanding',
};
</script>
