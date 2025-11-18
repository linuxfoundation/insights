<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<!-- 
  This component is used to display a organization row in a leaderboard table row.
  It is used to display the organization name, rank, and value in a leaderboard table row.
 -->

<template>
  <div class="flex items-center w-full">
    <!-- Organization info -->
    <div class="flex-1 min-w-0 flex gap-3 items-center">
      <lfx-avatar
        :src="item.logoUrl"
        type="organization"
        :aria-label="item.logoUrl && item.name"
      />
      <p
        :title="item.name"
        class="font-medium text-neutral-900 overflow-hidden text-ellipsis whitespace-nowrap max-w-full text-sm"
      >
        {{ item.name }}
      </p>
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

defineProps<{
  item: Leaderboard;
  leaderboardConfig: LeaderboardConfig;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxOrganizationMinimizedRowDisplay',
};
</script>
