<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex items-center w-full"
    :class="{
      'hover:bg-neutral-50 rounded-lg transition-all duration-300 cursor-pointer p-3': !isSmall,
    }"
  >
    <!-- Rank -->
    <div
      v-if="!isSmall"
      class="w-10 shrink-0 text-neutral-900 font-secondary overflow-hidden overflow-ellipsis"
    >
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
        :class="{ 'hover:underline text-sm cursor-pointer': isSmall }"
        @click="navigateToProject(item.slug)"
      >
        {{ item.name }}
      </p>
    </div>

    <!-- Stats -->
    <div class="w-1/4 shrink-0 flex flex-col gap-2 items-end justify-center">
      <p
        class="text-base font-normal text-neutral-900 text-right w-full"
        :class="{ 'text-sm': isSmall }"
      >
        <component
          :is="leaderboardConfig?.dataDisplay"
          :is-data-duration="leaderboardConfig?.isDataDuration"
          :value="item.value"
        />
      </p>
      <lfx-leaderboard-trend-display
        v-if="!leaderboardConfig?.hideTrend && !isSmall"
        :is-time-display="isTimeDisplay"
        :is-data-duration="leaderboardConfig?.isDataDuration"
        :data="item"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import LfxLeaderboardTrendDisplay from '../data-displays/trend-display.vue';
import TimeDurationDataDisplay from '../data-displays/time-duration.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { LfxRoutes } from '~/components/shared/types/routes';

const router = useRouter();

const props = withDefaults(
  defineProps<{
    item: Leaderboard;
    leaderboardConfig: LeaderboardConfig;
    isSmall?: boolean;
  }>(),
  {
    isSmall: false,
  },
);

const isTimeDisplay = computed(() => {
  return props.leaderboardConfig.dataDisplay === TimeDurationDataDisplay;
});

const navigateToProject = (slug: string) => {
  router.push({ name: LfxRoutes.PROJECT, params: { slug } });
};
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardTable',
};
</script>
