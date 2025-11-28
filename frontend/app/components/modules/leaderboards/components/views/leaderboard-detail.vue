<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container">
    <div class="flex gap-10">
      <div class="lg:w-1/5 w-1/4 md:block hidden min-w-50">
        <div
          class="flex flex-col justify-between items-start md:flex hidden min-w-50 sticky bg-white pt-10 z-[11] lg:top-17 top-14"
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
      </div>
      <div class="lg:w-3/5 md:w-3/4 w-full min-w-0">
        <div class="sticky lg:top-17 top-14 z-10 bg-white sm:pt-10 pt-6">
          <!-- Header section -->
          <lfx-leaderboard-detail-header
            v-model:collection-slug="collectionSlug"
            :config="leaderboardConfig"
            @item-click="handleSearchItemClick"
          />

          <!-- Table header -->
          <lfx-table-header
            v-if="items.length > 0"
            :config="leaderboardConfig"
            class="border-b border-neutral-200 px-0 lg:px-3 pb-4"
          />
        </div>
        <div class="mt-6">
          <lfx-leaderboard-table
            v-if="items.length > 0"
            :leaderboard-config="leaderboardConfig"
            :data="items"
            :is-loading="isPending || isFetchingNextPage"
            :is-force-loading="isScrollingIntoRow"
            :has-next-page="hasNextPage"
            @fetch-next-page="fetchNextPage"
          />
          <!-- Empty state -->
          <div
            v-else
            class="flex flex-col gap-6 items-center justify-center px-0 py-20 w-full"
          >
            <lfx-icon
              name="eyes"
              type="light"
              :size="80"
              class="text-neutral-200"
            />
            <div class="flex flex-col gap-2 items-center text-center w-full">
              <h3 class="font-secondary font-bold text-heading-3 text-black">
                No {{ pluralize(leaderboardConfig?.entityLabel.toLowerCase(), 2) }} found
              </h3>
              <p class="text-body-2 text-neutral-500">Try adjusting your filters to find what you're looking for.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="w-1/5 hidden lg:block">&nbsp;</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch, ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import pluralize from 'pluralize';
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
import { LfxRoutes } from '~/components/shared/types/routes';

const route = useRoute();

// Props
const props = defineProps<{
  leaderboardKey: string;
}>();

const isScrollingIntoRow = ref<boolean>(false);
const collectionSlug = ref<string>('');

const params = computed(() => ({
  leaderboardType: props.leaderboardKey,
  initialPageSize: 100,
  collectionSlug: collectionSlug.value && collectionSlug.value !== 'all' ? collectionSlug.value : undefined,
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
      element.classList.add('bg-brand-100');

      setTimeout(() => {
        element.classList.remove('bg-brand-100');
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
