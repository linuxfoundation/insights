<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- Table header -->
  <div
    class="flex items-center justify-between px-3 py-0 w-full text-xs font-semibold text-neutral-400 whitespace-pre-wrap"
  >
    <div class="w-10 shrink-0">#</div>
    <div class="flex-1 min-w-0">Project</div>
    <div class="flex-1 min-w-0 text-right">{{ leaderboardConfig?.columnLabel }}</div>
  </div>
  <!-- Leaderboard items -->
  <div class="flex flex-col items-start w-full">
    <div
      v-for="item in data"
      :key="item.id"
      class="flex items-center p-3 w-full hover:bg-neutral-50 rounded-lg transition-all duration-300 cursor-pointer"
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
        <p class="text-base leading-5 font-medium text-neutral-900 overflow-hidden overflow-ellipsis">
          {{ item.name }}
        </p>
      </div>

      <!-- Stats -->
      <div class="w-1/4 shrink-0 flex flex-col gap-2 items-end justify-center">
        <p
          class="text-base leading-5 font-normal text-neutral-900 text-right w-full overflow-hidden overflow-ellipsis whitespace-pre-wrap"
        >
          {{ formatValue(item.value) }}
        </p>
        <lfx-leaderboard-trend-display :data="item" />
      </div>
    </div>
    <template v-for="i in 10">
      <div
        v-if="isLoading"
        :key="i"
        class="flex items-center p-3 w-full gap-3"
      >
        <div class="flex items-center justify-start">
          <div class="w-10 shrink-0 text-neutral-900 font-secondary">
            {{ data.length + i }}
          </div>
          <lfx-skeleton class="!w-12 !h-12" />
        </div>
        <div class="flex-1 shrink-0">
          <lfx-skeleton class="!w-2/4 !h-5" />
        </div>
        <lfx-skeleton class="!w-16 !h-5" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import LfxLeaderboardTrendDisplay from '../data-displays/trend-display.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';

defineProps<{
  leaderboardConfig: LeaderboardConfig;
  isLoading: boolean;
  data: Leaderboard[];
}>();

const formatValue = (value: number) => {
  if (!value && value !== 0) {
    return 'data';
  }
  return formatNumber(value);
};
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardTable',
};
</script>
