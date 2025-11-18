<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<!-- 
  This component is used to display a project row with a timestamp value in a leaderboard table row.
  It is used to display the project name, rank, and value in a leaderboard table row.
 -->

<template>
  <router-link
    v-if="item.slug"
    class="w-full"
    :to="`/project/${item.slug}`"
    :data-rank="item.rank"
  >
    <div
      class="flex items-center w-full hover:bg-neutral-50 rounded-lg transition-all duration-300 cursor-pointer sm:px-3 px-0 h-15"
    >
      <!-- Rank -->
      <div class="w-10 shrink-0 text-neutral-900 font-secondary overflow-hidden overflow-ellipsis">
        {{ item.rank }}
      </div>

      <!-- Project info -->
      <div class="flex-1 min-w-0 flex gap-3 items-center">
        <lfx-avatar
          :src="item.logoUrl"
          type="organization"
          :aria-label="item.logoUrl && item.name"
        />
        <p
          :title="item.name"
          class="text-base leading-5 font-medium text-neutral-900 overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
          @click="navigateToProject(item.slug)"
        >
          {{ item.name }}
        </p>
      </div>

      <!-- Stats -->
      <div class="w-1/4 shrink-0">
        <div
          class="text-base font-normal text-neutral-900 text-right w-full flex flex-col gap-2 items-end justify-center"
        >
          <timestamp-data-display :data="item" />

          <timestamp-duration-trend :data="item" />
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import TimestampDataDisplay from '../data-displays/timestamp.vue';
import TimestampDurationTrend from '../trends/timestamp-duration.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { LfxRoutes } from '~/components/shared/types/routes';

const router = useRouter();

defineProps<{
  item: Leaderboard;
  leaderboardConfig: LeaderboardConfig;
}>();

const navigateToProject = (slug: string) => {
  if (!slug) {
    return;
  }
  router.push({ name: LfxRoutes.PROJECT, params: { slug } });
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectTimestampRowDisplay',
};
</script>
