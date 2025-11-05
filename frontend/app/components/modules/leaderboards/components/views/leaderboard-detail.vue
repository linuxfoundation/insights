<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="pt-10">
    <div class="container flex md:gap-10 gap-0 md:flex-row flex-col">
      <div class="md:hidden fixed z-10 top-32 left-0 w-full">
        <div class="container flex justify-between">
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

          <!-- Sidebar navigation -->
          <lfx-leaderboard-sidebar :leaderboard-key="leaderboardKey" />
        </div>
      </div>

      <div
        ref="sidebarRef"
        class="md:w-1/5 w-full flex md:flex-col flex-row md:justify-start justify-between md:items-start items-center md:flex hidden min-w-50"
        :class="scrollTop > 0 ? 'fixed bg-white pt-32 mt-2 top-0 z-10' : ''"
        :style="scrollTop > 0 && sidebarWidth ? { width: sidebarWidth + 'px' } : {}"
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
      <lfx-maintain-height
        :scroll-top="scrollTop"
        :class="scrollTop > 0 ? 'fixed !w-full bg-white pt-22 top-0 left-0' : 'relative md:pt-0 pt-4'"
        class="z-9 lg:w-3/5 md:w-3/4 w-full"
        :loaded="pageWidth > 0"
      >
        <div :class="[scrollTop > 1 ? 'container w-full md:pt-12 pt-16 flex gap-10' : '']">
          <div
            v-if="scrollTop > 1"
            class="lg:w-1/5 w-1/4 md:block hidden min-w-50"
          >
            &nbsp;
          </div>
          <div
            class="flex flex-col gap-6 md:pt-0 pt-10"
            :class="[scrollTop > 1 ? 'lg:w-3/5 md:w-3/4 w-full' : 'w-full']"
          >
            <!-- Header section -->
            <lfx-leaderboard-detail-header :config="leaderboardConfig" />

            <!-- Table header -->
            <lfx-table-header
              :config="leaderboardConfig"
              class="border-b border-neutral-200 px-0 lg:px-3 pb-4"
            />
          </div>
          <div
            v-if="scrollTop > 1"
            class="w-1/5 lg:block hidden"
          >
            &nbsp;
          </div>
        </div>
      </lfx-maintain-height>

      <div
        v-if="scrollTop < 1"
        class="w-1/5 lg:block hidden"
      >
        &nbsp;
      </div>
    </div>
  </div>

  <div class="container">
    <div class="flex gap-10">
      <div class="lg:w-1/5 w-1/4 md:block hidden min-w-50">&nbsp;</div>
      <div class="lg:w-3/5 md:w-3/4 w-full min-w-0">
        <lfx-leaderboard-table
          :leaderboard-config="leaderboardConfig"
          :data="items"
          :is-loading="isPending || isFetchingNextPage"
          :has-next-page="hasNextPage"
          @fetch-next-page="fetchNextPage"
        />
      </div>
      <div class="w-1/5 hidden lg:block">&nbsp;</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onServerPrefetch, ref, watch } from 'vue';
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
import useScroll from '~/components/shared/utils/scroll';
import useResponsive from '~/components/shared/utils/responsive';
import LfxMaintainHeight from '~/components/uikit/maintain-height/maintain-height.vue';
import { LfxRoutes } from '~/components/shared/types/routes';

// Props
const props = defineProps<{
  leaderboardKey: string;
}>();

const { scrollTop } = useScroll();
const { pageWidth } = useResponsive();
const sidebarRef = ref<HTMLElement | null>(null);
const sidebarWidth = ref<number>(0);

onMounted(() => {
  if (sidebarRef.value) {
    sidebarWidth.value = sidebarRef.value.offsetWidth;
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
  if (leaderboardConfig.value && leaderboardConfig.value.dataTransform) {
    return tmpList.map((item: Leaderboard) => leaderboardConfig.value.dataTransform!(item));
  }

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
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardDetail',
};
</script>
