<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container py-10">
    <div class="flex gap-10">
      <!-- Back button section -->
      <div class="w-1/4">
        <router-link to="/leaderboards">
          <lfx-button type="ghost">
            <lfx-icon
              name="angle-left"
              :size="16"
            />
            All leaderboards
          </lfx-button>
        </router-link>
      </div>

      <!-- Main content section -->
      <div class="flex flex-col gap-6 w-3/4">
        <!-- Header section -->
        <lfx-leaderboard-detail-header :config="leaderboardConfig" />

        <lfx-leaderboard-table
          :leaderboard-config="leaderboardConfig"
          :data="items"
          :is-loading="isPending || isFetchingNextPage"
        />

        <lfx-button
          v-if="hasNextPage"
          type="transparent"
          :loading="isFetchingNextPage"
          class="mt-4 w-full justify-center"
          @click="fetchNextPage"
        >
          View more
        </lfx-button>
      </div>

      <!-- Sidebar navigation -->
      <lfx-leaderboard-sidebar :leaderboard-key="leaderboardKey" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import leaderboardConfigs from '../../config/index.config';
import LfxLeaderboardTable from '../sections/leaderboard-table.vue';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import LfxLeaderboardSidebar from '../sections/leaderboard-sidebar.vue';
import LfxLeaderboardDetailHeader from '../sections/leaderboard-detail-header.vue';
import { LEADERBOARD_API_SERVICE } from '../../services/leaderboard.api.service';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';

// Props
const props = defineProps<{
  leaderboardKey: string;
}>();

// State
const searchQuery = ref('');

const params = computed(() => ({
  leaderboardType: props.leaderboardKey,
  initialPageSize: 50,
  search: searchQuery.value,
}));

const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } =
  LEADERBOARD_API_SERVICE.fetchLeaderboardDetails(params);

const items = computed<Leaderboard[]>(() => {
  if (!data.value) {
    return [];
  }
  return data.value?.pages.flatMap((page) => page as Leaderboard[]) || [];
});

const leaderboardConfig = computed<LeaderboardConfig>(() => {
  const config = leaderboardConfigs.find((config) => config.key === props.leaderboardKey);
  return config ?? leaderboardConfigs[0]!;
});
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardDetail',
};
</script>
