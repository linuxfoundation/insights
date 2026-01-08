<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div style="width: 1200px; height: 630px; position: relative">
    <img
      src="/images/og-image/leaderboard.svg"
      alt=""
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
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
        width: 807px;
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
        font-size: 56px;
        font-weight: 300;
        color: #0f172a;
        line-height: 80px;
      "
    >
      {{ leaderboardTitle }}
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
withDefaults(
  defineProps<{
    leaderboardTitle?: string;
  }>(),
  {
    leaderboardTitle: '',
  },
);
</script>
