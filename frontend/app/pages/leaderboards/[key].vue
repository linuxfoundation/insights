<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20">
    <lfx-leaderboard-detail
      :leaderboard-key="leaderboardKey"
      :items="mockItems"
      :highlighted-index="1"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed } from 'vue';
import LfxLeaderboardDetail from '~/components/modules/leaderboards/components/views/leaderboard-detail.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

const route = useRoute();
const leaderboardKey = computed(() => route.params.key as string);

// Mock data for demonstration
const mockItems: Leaderboard[] = computed(() => [
  {
    rank: 1,
    id: '1',
    segmentId: 'segment-1',
    name: 'The Linux Kernel',
    slug: 'the-linux-kernel',
    logoUrl: '',
    leaderboardType: 'project',
    value: 100,
    previousPeriodValue: 88,
  },
  {
    rank: 2,
    id: '2',
    segmentId: 'segment-2',
    name: 'The Quantum Framework',
    slug: 'the-quantum-framework',
    logoUrl: '',
    leaderboardType: 'project',
    value: 90,
    previousPeriodValue: 105,
  },
  {
    rank: 3,
    id: '3',
    segmentId: 'segment-3',
    name: 'The Stellar Database',
    slug: 'the-stellar-database',
    logoUrl: '',
    leaderboardType: 'project',
    value: 80,
    previousPeriodValue: 80,
  },
  {
    rank: 4,
    id: '4',
    segmentId: 'segment-4',
    name: 'The Nebula API',
    slug: 'the-nebula-api',
    logoUrl: '',
    leaderboardType: 'project',
    value: 70,
    previousPeriodValue: 62,
  },
  {
    rank: 5,
    id: '5',
    segmentId: 'segment-5',
    name: 'The Aurora Toolkit',
    slug: 'the-aurora-toolkit',
    logoUrl: '',
    leaderboardType: 'project',
    value: 60,
    previousPeriodValue: 53,
  },
  {
    rank: 6,
    id: '6',
    segmentId: 'segment-6',
    name: 'The Phoenix Compiler',
    slug: 'the-phoenix-compiler',
    logoUrl: '',
    leaderboardType: 'project',
    value: 50,
    previousPeriodValue: 44,
  },
  {
    rank: 7,
    id: '7',
    segmentId: 'segment-7',
    name: 'The Atlas Library',
    slug: 'the-atlas-library',
    logoUrl: '',
    leaderboardType: 'project',
    value: 40,
    previousPeriodValue: 35,
  },
  {
    rank: 8,
    id: '8',
    segmentId: 'segment-8',
    name: 'The Horizon CLI',
    slug: 'the-horizon-cli',
    logoUrl: '',
    leaderboardType: 'project',
    value: 30,
    previousPeriodValue: 26,
  },
  {
    rank: 9,
    id: '9',
    segmentId: 'segment-9',
    name: 'The Titan Network',
    slug: 'the-titan-network',
    logoUrl: '',
    leaderboardType: 'project',
    value: 20,
    previousPeriodValue: 17,
  },
  {
    rank: 10,
    id: '10',
    segmentId: 'segment-10',
    name: 'The Echo Player',
    slug: 'the-echo-player',
    logoUrl: '',
    leaderboardType: 'project',
    value: 10,
    previousPeriodValue: 8,
  },
  {
    rank: 11,
    id: '11',
    segmentId: 'segment-11',
    name: 'The Prism Editor',
    slug: 'the-prism-editor',
    logoUrl: '',
    leaderboardType: 'project',
    value: 5,
    previousPeriodValue: 4,
  },
  {
    rank: 12,
    id: '12',
    segmentId: 'segment-12',
    name: 'The Odyssey Framework',
    slug: 'the-odyssey-framework',
    logoUrl: '',
    leaderboardType: 'project',
    value: 2,
    previousPeriodValue: 1,
  },
]);

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
