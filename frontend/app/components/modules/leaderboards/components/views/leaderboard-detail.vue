<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- <lfx-maintain-height
    :scroll-top="scrollTop"
    :class="scrollTop > 0 ? 'fixed w-full bg-white pt-20 pb-6 top-0' : 'relative'"
    class="z-10 w-full"
    :loaded="pageWidth > 0"
  > -->
  <div class="pt-10">
    <div class="container flex gap-10">
      <!-- Back button section -->
      <div
        class="w-1/5"
        :class="[scrollTop > 1 ? 'fixed z-10' : 'relative']"
      >
        <router-link to="/leaderboards">
          <lfx-button type="ghost">
            <lfx-icon
              name="angle-left"
              :size="16"
            />
            All leaderboards
          </lfx-button>
        </router-link>

        <!-- Sidebar navigation -->
        <lfx-leaderboard-sidebar :leaderboard-key="leaderboardKey" />
      </div>

      <!-- Main content section -->
      <lfx-maintain-height
        :scroll-top="scrollTop"
        :class="scrollTop > 0 ? 'fixed w-full bg-white pt-20 pb-6 top-0 left-0' : 'relative'"
        class="z-9 w-3/5"
        :loaded="pageWidth > 0"
      >
        <div :class="[scrollTop > 1 ? 'container w-full pt-20 flex gap-10' : '']">
          <div
            v-if="scrollTop > 1"
            class="w-1/5"
          >
            &nbsp;
          </div>
          <div
            class="flex flex-col gap-6"
            :class="[scrollTop > 1 ? 'w-3/5' : 'w-full']"
          >
            <!-- Header section -->
            <lfx-leaderboard-detail-header
              :config="leaderboardConfig"
              @search="handleSearch"
            />

            <!-- Table header -->
            <div
              class="flex items-center justify-between px-3 pb-4 w-full text-xs font-semibold text-neutral-400 whitespace-pre-wrap border-b border-neutral-200 bg-white"
            >
              <div class="w-10 shrink-0">#</div>
              <div class="flex-1 min-w-0">Project</div>
              <div class="flex-1 min-w-0 text-right">{{ leaderboardConfig?.columnLabel }}</div>
            </div>
          </div>
          <div
            v-if="scrollTop > 1"
            class="w-1/5"
          >
            &nbsp;
          </div>
        </div>
      </lfx-maintain-height>

      <div
        v-if="scrollTop < 1"
        class="w-1/5"
      >
        &nbsp;
      </div>
    </div>
  </div>

  <div class="container">
    <div class="flex gap-10">
      <div class="w-1/5">&nbsp;</div>
      <div class="w-3/5">
        <lfx-leaderboard-table
          :leaderboard-config="leaderboardConfig"
          :data="items"
          :is-loading="isPending || isFetchingNextPage"
          :has-next-page="hasNextPage"
          @fetch-next-page="fetchNextPage"
        />
      </div>
      <div class="w-1/5">&nbsp;</div>
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
import type { Pagination } from '~~/types/shared/pagination';
import useScroll from '~/components/shared/utils/scroll';
import useResponsive from '~/components/shared/utils/responsive';
import LfxMaintainHeight from '~/components/uikit/maintain-height/maintain-height.vue';

// Props
const props = defineProps<{
  leaderboardKey: string;
}>();

const { scrollTop } = useScroll();
const { pageWidth } = useResponsive();
// State
const searchQuery = ref('');

const params = computed(() => ({
  leaderboardType: props.leaderboardKey,
  initialPageSize: 100,
  search: searchQuery.value,
}));

// const searchParams = computed(() => ({
//   leaderboardType: props.leaderboardKey,
//   search: searchQuery.value,
// }));

// const { data: searchData, isPending: isSearchPending } =
//   LEADERBOARD_API_SERVICE.fetchLeaderboardDetailSearch(searchParams);

const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } =
  LEADERBOARD_API_SERVICE.fetchLeaderboardDetails(params);

const items = computed(() => {
  // @ts-expect-error - TanStack Query type inference issue with Vue
  return data.value?.pages.flatMap((page: Pagination<Leaderboard>) => page.data) || [];
});

const leaderboardConfig = computed<LeaderboardConfig>(() => {
  const config = leaderboardConfigs.find((config) => config.key === props.leaderboardKey);
  return config ?? leaderboardConfigs[0]!;
});

const handleSearch = (query: string) => {
  searchQuery.value = query;
};
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardDetail',
};
</script>
