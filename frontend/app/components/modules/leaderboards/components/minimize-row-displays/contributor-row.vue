<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<!--
  This component is used to display a contributor row in a leaderboard table row.
  It is used to display the contributor name, rank, and value in a leaderboard table row.
 -->

<template>
  <div class="flex items-center w-full">
    <!-- Contributor info -->
    <div class="flex-1 min-w-0 flex gap-3 items-center">
      <lfx-avatar
        :src="item.logoUrl"
        type="member"
        :aria-label="item.logoUrl && item.name"
      />

      <lfx-tooltip :disabled="!item.githubHandle">
        <template
          v-if="item.githubHandle"
          #content
        >
          <a
            :href="`https://github.com/${item.githubHandle}`"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 text-white"
          >
            <lfx-icon
              name="github"
              type="brands"
              :size="14"
            />
            <span class="text-xs font-semibold">{{ item.githubHandle }}</span>
            <lfx-icon
              name="arrow-up-right-from-square"
              type="regular"
              :size="14"
              class="text-neutral-400"
            />
          </a>
        </template>
        <component
          :is="item.githubHandle ? 'a' : 'p'"
          :href="item.githubHandle ? `https://github.com/${item.githubHandle}` : undefined"
          :target="item.githubHandle ? '_blank' : undefined"
          :rel="item.githubHandle ? 'noopener noreferrer' : undefined"
          :title="item.name"
          class="text-sm leading-5 font-medium text-neutral-900 overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
          :class="item.githubHandle ? 'hover:underline' : ''"
        >
          {{ item.name }}
        </component>
      </lfx-tooltip>
    </div>

    <!-- Stats -->
    <div class="w-1/4 shrink-0">
      <div class="flex flex-col gap-2 items-end justify-center font-normal text-neutral-900 text-right w-full text-sm">
        <numeric-data-display :data="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import NumericDataDisplay from '../data-displays/numeric.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

defineProps<{
  item: Leaderboard;
  leaderboardConfig: LeaderboardConfig;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxContributorMinimizedRowDisplay',
};
</script>
