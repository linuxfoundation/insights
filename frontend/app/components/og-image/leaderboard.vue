<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div style="width: 1200px; height: 630px; display: flex; align-items: center; justify-content: center">
    <img
      src="/images/og-image/background.svg"
      style="position: absolute; inset: 0; width: 100%; height: 100%"
    />
    <!-- Leaderboard Label -->
    <div
      style="
        position: absolute;
        left: 80px;
        top: 80px;
        font-family: 'Inter', sans-serif;
        font-size: 20px;
        font-weight: 400;
        color: #002648;
        text-transform: uppercase;
        letter-spacing: 10px;
        line-height: 32px;
      "
    >
      LEADERBOARD
    </div>

    <!-- Main Title -->
    <div
      style="
        position: absolute;
        left: 80px;
        top: 136px;
        width: 807px;
        font-family: 'Roboto Slab', serif;
        font-size: 64px;
        font-weight: 300;
        color: #0f172a;
        line-height: 80px;
      "
    >
      {{ title }}
    </div>

    <!-- Decorative Icon -->
    <div
      style="
        position: absolute;
        top: 15px;
        right: -140px;
        width: 600px;
        height: 600px;
        opacity: 0.5;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <img
        src="/images/og-image/leaderboard/contributors.svg"
        alt="Contributors"
        style="width: 600px; height: 600px; object-fit: contain"
      />
    </div>

    <!-- LFX Insights Logo -->
    <img
      src="/images/lfx-insights-logo.svg"
      alt="LFX Insights"
      style="position: absolute; left: 80px; top: 472px; width: 352px; height: 48px"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import leaderboardConfigs from '~/components/modules/leaderboards/config/index.config';

const props = withDefaults(
  defineProps<{
    leaderboardKey?: string;
  }>(),
  {
    leaderboardKey: '',
  },
);

// Extract only serializable data
const config = computed(() => leaderboardConfigs.find((c) => c.key === props.leaderboardKey));
const title = computed(() => config.value?.name || 'Leaderboard');
</script>
