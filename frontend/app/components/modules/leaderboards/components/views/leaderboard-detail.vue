<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="md:pt-10 pt-6">
    <div class="container flex md:gap-10 gap-0 md:flex-row flex-col">
      <div
        ref="sidebarRef"
        class="md:w-1/5 w-full flex md:flex-col flex-row md:justify-start justify-between md:items-start items-center md:flex hidden min-w-50 fixed bg-white pt-32 mt-2 top-0 z-[11]"
        :style="{ width: sidebarWidth + 'px' }"
      >
        <router-link
          :to="{ name: LfxRoutes.LEADERBOARDS }"
          class="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 hover:font-medium transition-all duration-100"
        >
          <lfx-icon
            name="angle-left"
            :size="15"
          />
          All leaderboards
        </router-link>

        <div class="h-px bg-neutral-200 w-full my-4"></div>
        <!-- Sidebar navigation -->
        <lfx-leaderboard-sidebar :leaderboard-key="leaderboardKey" />
      </div>

      <!-- Main content section -->
      <!-- <lfx-maintain-height
        :scroll-top="scrollTop"
        class="z-10 w-full fixed !w-full bg-white pt-22 top-0 left-0"
        :loaded="pageWidth > 0"
      > -->
      <div class="z-10 w-full fixed !w-full bg-white pt-22 top-0 left-0">
        <div
          ref="headerContainerRef"
          class="container w-full md:pt-12 pt-8 flex gap-10"
        >
          <div class="lg:w-1/5 w-1/4 md:block hidden min-w-50">&nbsp;</div>
          <div class="flex flex-col gap-6 lg:w-3/5 md:w-3/4 w-full">
            <!-- Header section -->
            <lfx-leaderboard-detail-header
              :config="leaderboardConfig"
              @item-click="handleSearchItemClick"
            />

            <!-- Table header -->
            <lfx-table-header
              :config="leaderboardConfig"
              class="border-b border-neutral-200 px-0 lg:px-3 pb-4"
            />
          </div>
          <div class="w-1/5 lg:block hidden">&nbsp;</div>
        </div>
      </div>
      <!-- </lfx-maintain-height> -->

      <div class="w-1/5 lg:block hidden">&nbsp;</div>
    </div>
  </div>

  <div
    class="container"
    :style="{ paddingTop: headerHeight + 'px' }"
  >
    <div class="flex gap-10 lg:-mt-12 md:-mt-8 mt-4">
      <div class="lg:w-1/5 w-1/4 md:block hidden min-w-50">&nbsp;</div>
      <div class="lg:w-3/5 md:w-3/4 w-full min-w-0">
        <lfx-leaderboard-table
          :leaderboard-config="leaderboardConfig"
          :data="items"
          :is-loading="isPending || isFetchingNextPage"
          :is-force-loading="isScrollingIntoRow"
          :has-next-page="hasNextPage"
          @fetch-next-page="fetchNextPage"
        />
      </div>
      <div class="w-1/5 hidden lg:block">&nbsp;</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onServerPrefetch, ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import leaderboardConfigs from '../../config/index.config';
import LfxLeaderboardTable from '../sections/leaderboard-table.vue';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import LfxLeaderboardSidebar from '../sections/leaderboard-sidebar.vue';
import LfxLeaderboardDetailHeader from '../sections/leaderboard-detail-header.vue';
import { LEADERBOARD_API_SERVICE } from '../../services/leaderboard.api.service';
import LfxTableHeader from '../sections/table-header.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type { Pagination } from '~~/types/shared/pagination';
import useResponsive from '~/components/shared/utils/responsive';
import { LfxRoutes } from '~/components/shared/types/routes';

const route = useRoute();

// Props
const props = defineProps<{
  leaderboardKey: string;
}>();

const { pageWidth } = useResponsive();
const sidebarRef = ref<HTMLElement | null>(null);
const sidebarWidth = ref<number>(0);
const isScrollingIntoRow = ref<boolean>(false);
const headerContainerRef = ref<HTMLElement | null>(null);
const headerHeight = ref<number>(0);

onMounted(() => {
  if (sidebarRef.value) {
    sidebarWidth.value = sidebarRef.value.offsetWidth;
  }

  if (headerContainerRef.value) {
    headerHeight.value = headerContainerRef.value.offsetHeight;
  }
});

const params = computed(() => ({
  leaderboardType: props.leaderboardKey,
  initialPageSize: 100,
}));

const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } =
  LEADERBOARD_API_SERVICE.fetchLeaderboardDetails(params);

const items = computed(() => {
  // @ts-expect-error - TanStack Query type inference issue with Vue
  const tmpList = data.value?.pages.flatMap((page: Pagination<Leaderboard>) => page.data) || [];

  return tmpList;
});

const leaderboardConfig = computed<LeaderboardConfig>(() => {
  const config = leaderboardConfigs.find((config) => config.key === props.leaderboardKey);
  return config ?? leaderboardConfigs[0]!;
});

// Server-side prefetching for infinite query
onServerPrefetch(async () => {
  // Prefetch the first page of the infinite query on the server
  await LEADERBOARD_API_SERVICE.prefetchLeaderboardDetails(params);
});

watch(pageWidth, () => {
  if (sidebarRef.value) {
    sidebarWidth.value = sidebarRef.value.offsetWidth;
  }
});

// Reset scroll position whenever the route changes (including back button)
watch(
  () => route.fullPath,
  async () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);
  },
  { immediate: true },
);

// Handle search item click to scroll to row
const handleSearchItemClick = async (item: Leaderboard) => {
  const targetRank = item.rank;
  isScrollingIntoRow.value = true;

  // Function to find and scroll to the row
  const scrollToRow = () => {
    const isRankInList = items.value.find((item: Leaderboard) => item.rank === targetRank);
    if (isRankInList) {
      isScrollingIntoRow.value = false;
    } else {
      return false;
    }

    const row = document.querySelector(`[data-rank="${targetRank}"]`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Add a brief highlight effect
      const element = row as HTMLElement;
      element.style.transition = 'background-color 0.3s ease';
      element.classList.add('bg-neutral-50');

      setTimeout(() => {
        element.classList.remove('bg-neutral-50');
      }, 2000);

      return true;
    }
    return false;
  };

  // First, try to find the row in the current view
  if (scrollToRow()) {
    return;
  }

  // If not found, we need to load more pages
  const currentItemCount = items.value.length;

  // Calculate how many pages we need to load
  // If the target rank is beyond what we've loaded, keep loading
  if (targetRank > currentItemCount) {
    // Load pages until we have enough items
    while (items.value.length < targetRank && hasNextPage.value) {
      await fetchNextPage();

      // Wait for the DOM to update
      await nextTick();

      // Check if the row is now available
      if (scrollToRow()) {
        return;
      }
    }
  }

  // Final attempt after all loading
  await nextTick();
  scrollToRow();
};
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardDetail',
};
</script>
