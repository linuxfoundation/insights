<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div style="width: 1200px; height: 630px; position: relative; display: flex">
    <img
      src="/images/og-image/leaderboard.png"
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
        line-height: 32px;
        width: 807px;
      "
    >
      L E A D E R B O A R D
    </div>

    <!-- Main Title -->
    <div
      style="
        position: absolute;
        left: 80px;
        top: 136px;
        width: 807px;
        height: 160px;
        font-family: 'Roboto Slab', serif;
        font-size: 56px;
        font-weight: 300;
        color: #0f172a;
        line-height: 80px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      "
    >
      {{ safeTitle }}
    </div>

    <!-- LFX Insights Logo -->
    <img
      src="/images/og-image/lfx-insights-logo.png"
      alt="LFX Insights"
      style="position: absolute; left: 80px; top: 472px; width: 352px; height: 48px"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    leaderboardTitle?: string;
  }>(),
  {
    leaderboardTitle: '',
  },
);

// Strip emojis and other problematic unicode characters that can crash resvg
const stripEmojis = (text: string): string => {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}]/gu,
      '',
    )
    .trim();
};

const safeTitle = computed(() => stripEmojis(props.leaderboardTitle));
</script>
