<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<!--
  This component is used to display a contributor row in a leaderboard table row.
  It is used to display the contributor name, rank, and value in a leaderboard table row.
 -->

<template>
  <div class="flex items-center w-full rounded-lg transition-all duration-300 sm:px-3 px-0 h-15">
    <!-- Rank -->
    <div class="w-10 shrink-0 text-neutral-900 font-secondary overflow-hidden overflow-ellipsis">
      {{ item.rank }}
    </div>

    <!-- Contributor info -->
    <div class="flex-1 min-w-0 flex gap-3 items-center">
      <lfx-avatar
        :src="item.logoUrl"
        type="member"
        :aria-label="item.logoUrl && item.name"
      />
      <div class="flex flex-col gap-1">
        <p
          :title="item.name"
          class="text-base leading-5 font-medium text-neutral-900 overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
        >
          {{ item.name }}
        </p>

        <a
          v-if="item.githubHandle"
          :href="`https://github.com/${item.githubHandle}`"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 text-xs leading-5 text-neutral-400 hover:text-neutral-500 whitespace-nowrap transition-colors"
        >
          <lfx-icon
            name="github"
            type="brands"
            :size="12"
          />
          <span class="font-medium overflow-hidden text-ellipsis">{{ item.githubHandle }}</span>
        </a>
      </div>
    </div>

    <!-- Stats -->
    <div class="w-1/4 shrink-0">
      <div
        class="text-base font-normal text-neutral-900 text-right w-full flex flex-col gap-2 items-end justify-center"
      >
        <numeric-data-display :data="item" />

        <numeric-trends :data="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import NumericDataDisplay from '../data-displays/numeric.vue';
import NumericTrends from '../trends/numeric-trends.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

defineProps<{
  item: Leaderboard;
  leaderboardConfig: LeaderboardConfig;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxContributorRowDisplay',
};
</script>
